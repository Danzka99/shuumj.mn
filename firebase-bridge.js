// Шүүмж — Firebase bridge.
// The page was written against Claude's artifact API (claude.use('db') / claude.use('user')).
// This module provides the same API on top of Firebase Auth + Cloud Firestore,
// so the same index.html runs on Vercel.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
  sendPasswordResetEmail, signOut, signInAnonymously, linkWithPopup, linkWithCredential,
  EmailAuthProvider, signInWithCredential
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const cfg = window.SHUUMJ_FIREBASE;
const app = initializeApp(cfg);
const auth = getAuth(app);
const fs = getFirestore(app);
const ADMINS = (window.SHUUMJ_ADMINS || []).map(e => String(e).toLowerCase());

// Everyone gets a silent anonymous account, so reviews work without signing in.
// Letters (complaints / thanks) still require a real Google or e-mail account.
const authReady = new Promise(res => {
  const off = onAuthStateChanged(auth, async u => {
    off();
    if (u) return res(u);
    try { const r = await signInAnonymously(auth); res(r.user); } catch (e) { res(null); } // Anonymous provider off → read-only guest
  });
});
const isAdmin = u => !!(u && u.email && ADMINS.includes(u.email.toLowerCase()));

const toErr = e => ({ code: e && e.code === 'permission-denied' ? 'invalid_argument' : 'unavailable', message: String((e && e.message) || e) });
const snapDoc = s => ({ id: s.id, exists: s.exists(), data: () => (s.exists() ? s.data() : undefined),
  metadata: { fromCache: s.metadata.fromCache, hasPendingWrites: s.metadata.hasPendingWrites } });
const snapQuery = s => ({ docs: s.docs.map(snapDoc), size: s.size, empty: s.empty, metadata: { fromCache: s.metadata.fromCache } });
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random())).replace(/[^a-z0-9]/gi, '').slice(0, 20);

function docRef(path) {
  const r = doc(fs, path);
  return {
    id: r.id, path,
    get: async () => snapDoc(await getDoc(r)),
    set: d => setDoc(r, d).catch(e => { throw toErr(e); }),
    // the page's update() merges nested maps → Firestore set with merge:true does exactly that
    update: d => setDoc(r, d, { merge: true }).catch(e => { throw toErr(e); }),
    delete: () => deleteDoc(r).catch(e => { throw toErr(e); }),
    onSnapshot: (next, err) => onSnapshot(r, s => next(snapDoc(s)), e => err && err(toErr(e))),
    collection: p => colRef(path + '/' + p)
  };
}
function colRef(path) {
  const r = collection(fs, path);
  return {
    path,
    doc: id => docRef(path + '/' + (id || newId())),
    get: async () => snapQuery(await getDocs(r)),
    onSnapshot: (next, err) => onSnapshot(r, s => next(snapQuery(s)), e => err && err(toErr(e))),
    add: async d => { const x = docRef(path + '/' + newId()); await x.set(d); return x; }
  };
}
const db = { doc: docRef, collection: colRef };

const user = {
  id: async () => { const u = await authReady; return u ? u.uid : null; },
  isOwner: async () => isAdmin(await authReady),
  canEdit: async () => isAdmin(await authReady),
  can: async () => !!(await authReady),
  isGuest: async () => { const u = await authReady; return !!(u && u.isAnonymous); },
  me: async () => { const u = await authReady; return { name: u ? (u.displayName || '') : '' }; },
  profiles: async ids => {
    const out = {};
    await Promise.all(ids.map(async id => {
      try { const s = await getDoc(doc(fs, 'profiles/' + id)); out[id] = { name: s.exists() ? (s.data().name || '') : '' }; }
      catch (e) { out[id] = { name: '' }; }
    }));
    return out;
  }
};

// public display name, so reviews can show who wrote them (never the e-mail)
async function publishProfile(u) {
  if (!u || u.isAnonymous) return;
  try { await setDoc(doc(fs, 'profiles/' + u.uid), { name: (u.displayName || '').slice(0, 60) }, { merge: true }); } catch (e) {}
}
authReady.then(publishProfile);

window.SHUUMJ_AUTH = {
  google: async () => {
    const p = new GoogleAuthProvider(); const cur = auth.currentUser; let r;
    if (cur && cur.isAnonymous) {
      // keep the guest's reviews: upgrade the anonymous account in place when possible
      try { r = await linkWithPopup(cur, p); }
      catch (e) {
        const cred = GoogleAuthProvider.credentialFromError(e);
        if (cred) r = await signInWithCredential(auth, cred); else throw e;
      }
    } else r = await signInWithPopup(auth, p);
    await publishProfile(r.user);
  },
  login: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
  signup: async (name, email, pw) => {
    const cur = auth.currentUser;
    const r = (cur && cur.isAnonymous)
      ? await linkWithCredential(cur, EmailAuthProvider.credential(email, pw))
      : await createUserWithEmailAndPassword(auth, email, pw);
    await updateProfile(r.user, { displayName: name });
    await publishProfile(r.user);
  },
  reset: email => sendPasswordResetEmail(auth, email),
  logout: () => signOut(auth)
};

if (window.__shuumjReady) window.__shuumjReady({ use: async n => (n === 'db' ? db : n === 'user' ? user : null) });
