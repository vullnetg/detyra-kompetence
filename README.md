# Detyra Kompetence · Fizika 6

Ushtrime në shqip për klasën e gjashtë, të bazuara në hartën mësimore të librit [Fizika 6 Libër bazë](https://dukagjinibotime.com/libra/fizika-6-liber-baze) nga Dukagjini, deri në faqen 85.

- Çdo test paraqet një situatë, të dhënat dhe gjashtë pyetje me alternativa. Pas dorëzimit shfaqen numri i përgjigjeve të sakta dhe të gabuara, pikët nga 12 dhe një ushtrim shtesë.
- Për çdo gabim shfaqen përgjigjja e saktë, shpjegimi dhe faqet e librit për përsëritje.
- Banka në `questions.js` përmban 16 situata dhe 96 pyetje me pikë. Çdo histori përdoret një herë për cikël. Në ciklin pasues, skenari i parë ndryshon nga skenari i fundit i ciklit të kaluar. Alternativat përzihen në çdo test.
- Historia e testeve, testi i fundit dhe datat e rikujtimit ruhen në shfletuesin e nxënësit. Temat për rikujtim ndikojnë në zgjedhjen e skenarit të ardhshëm kur ato gjenden në një skenar të papërdorur. Rikujtimet zhvillohen me intervale prej 1, 3, 7 dhe 14 ditësh.
- Pyetjet dhe përgjigjet janë pjesë e aplikacionit statik. Aplikacioni është për ushtrime individuale.

## Përdorimi lokal

Ekzekuto `node serve.js` nga rrënja e projektit me Node.js 20 ose më të ri dhe hap `http://127.0.0.1:4173`.

## Publikimi në Vercel

Importo depon nga GitHub si projekt të ri në Vercel. Mbaje rrënjën e projektit te rrënja e depos. Konfigurimi në `vercel.json` përdor **Other** dhe shërben skedarët statikë nga rrënja. Projekti funksionon pa variabla mjedisi dhe pa instalim varësish.

## Imazhi

Imazhi `physics-lab.jpg` u krijua me gjeneratorin e integruar të imazheve.

<details>
<summary>Kërkesa për gjenerimin e imazhit</summary>

Create an editorial hero still life for an Albanian school physics practice website, no UI, no lettering, no watermark. Wide landscape 4:3 or 3:2. On a seamless pale lilac studio background and tabletop, a beautiful physical Newton's cradle dominates the upper and central image: polished chrome balls on very thin wires, small dark graphite support frame in a clear three-quarter view, one ball pulled up softly. Beside it in foreground lower right lies an authentic miniature purple-blue horseshoe magnet with brushed silver tips and one loose steel ball. A faint light-lavender checker-grid sheet lies partly under the cradle. Attractive physical surfaces, warm soft directional window lighting with shadows, premium colorful educational editorial photography with very subtle flecks, sophisticated soft orchid and periwinkle monochrome with metallic contrast. Keep every main object fully in frame and inside the central 78% of the composition, with a balanced amount of breathing room above and at sides for responsive crops. No people, no plants, no posters, no diagrams, no fake text.

</details>
