# Шүүмж — Иргэдийн үнэлгээ, гомдол, талархлын платформ

Монгол Улсын газрын зураг дээр аймаг → сум → дүүрэг → хороо руу томруулж, төрийн болон хувийн байгууллагад од, сэтгэгдэл, 👍/👎 өгөх, 20,000₮-өөр албан гомдол эсвэл талархал илгээх вэб сайт.

Статик сайт (Vercel) + Firebase (нэвтрэлт, өгөгдлийн сан).

## Файлууд

| Файл | Юу вэ |
|---|---|
| `index.html` | Бүх сайт (газрын зураг, үнэлгээ, гомдол, миний хуудас, удирдлага) |
| `geo.json`, `units.json` | Аймаг, сум, дүүрэг, хорооны хил ба нэрс (ҮСХ, OCHA COD-AB, CC BY-IGO 3.0) |
| `firebase-config.js` | **Таны Firebase түлхүүрүүд + админ и-мэйл — заавал бөглөнө** |
| `firebase-bridge.js` | Сайтыг Firebase-тэй холбодог код (өөрчлөх шаардлагагүй) |
| `firestore.rules` | Өгөгдлийн сангийн хамгаалалтын дүрэм |
| `vercel.json` | Vercel тохиргоо |

## 1. Firebase тохируулах (≈10 минут, үнэгүй)

1. https://console.firebase.google.com → **Add project** → нэр: `shuumj` → Create.
2. **Build → Authentication → Get started → Sign-in method**:
   - **Google** → Enable → Save
   - **Email/Password** → Enable → Save
3. **Build → Firestore Database → Create database** → Location: `asia-east2` (Hong Kong) эсвэл `asia-northeast1` (Tokyo) → **Start in production mode**.
4. **Firestore → Rules** таб → `firestore.rules` файлын агуулгыг бүтнээр нь хуулж тавина.
   `admin_email@example.com`-г өөрийн Google и-мэйлээр (жижиг үсгээр) солиод **Publish**.
5. **Project settings (⚙) → General → Your apps → `</>` (Web)** → нэр `shuumj-web` → Register.
   Гарч ирэх `firebaseConfig` утгуудыг `firebase-config.js`-д хуулна.
   `SHUUMJ_ADMINS`-д мөн өөрийн и-мэйлээ бичнэ.

## 2. Vercel-д байршуулах

1. https://vercel.com → GitHub-аар нэвтэрнэ → **Add New → Project** → энэ репог **Import**.
2. Framework Preset: **Other**, Build command: хоосон, Output directory: хоосон → **Deploy**.
3. Сайт `https://<нэр>.vercel.app` хаягаар нээгдэнэ.
4. **Firebase → Authentication → Settings → Authorized domains → Add domain** → `<нэр>.vercel.app`
   (өөрийн домэйн холбовол түүнийг ч нэмнэ). Үүнийг хийхгүй бол Google-ээр нэвтрэх ажиллахгүй.

Цаашид репод өөрчлөлт push хийх бүрт Vercel автоматаар шинэчилнэ.

## 3. Өөрийн домэйн (сонголттой)

Vercel → Project → **Settings → Domains** → жишээ нь `shuumj.mn` нэмээд, домэйн бүртгэгч дээрээ Vercel-ийн заасан DNS бичлэгийг (A / CNAME) оруулна. Дараа нь Firebase-ийн Authorized domains-д мөн нэмнэ.

## Анхаарах зүйлс

- **Төлбөр (20,000₮)** — онлайн төлбөр одоогоор холбогдоогүй. Захиалга бүртгэгдэж, админ "Төлбөр баталгаажсан" гэж гараар тэмдэглэнэ. QPay холбохын тулд QPay мерчант гэрээ болон серверийн функц (Vercel Functions) нэмэх шаардлагатай.
- **Утасны дугаараар нэвтрэх (SMS)** — Firebase-ийн Blaze (төлбөртэй) багц шаардана. Одоогоор Google болон и-мэйлээр нэвтэрнэ.
- `firebase-config.js` доторх түлхүүрүүд нууц биш (вэб хуудсанд ил байдаг). Хамгаалалтыг `firestore.rules` хангана.
- Firebase тохируулаагүй үед сайт "туршилтын горимоор" ажиллана: үнэлгээ зөвхөн тухайн цонхонд хадгалагдана.
