
// Global değişkenler
let sunucudanGelen;
let puan = 0;
let sira = 0;
let seciliSorular = [];
let zamanlayici = 30; // Başlangıç süresi 10 saniye
let zamanlayiciInterval; // Zamanlayıcı intervali tutacak değişken

// Sunucu bağlantısı
const baglanti = new XMLHttpRequest();
baglanti.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
        sunucudanGelen = JSON.parse(baglanti.responseText);
    }
};
baglanti.open("GET", "data.json", true);
baglanti.send();

// HTML nesnelerini seçme
const goruntulemeAlani = document.getElementById("sinav");
const cevapSecenekleri = document.querySelectorAll(".secenek");
const mevcutSoru = document.getElementById("soru");
const aAciklama = document.getElementById("aAciklama");
const bAciklama = document.getElementById("bAciklama");
const cAciklama = document.getElementById("cAciklama");
const dAciklama = document.getElementById("dAciklama");
const gonderButonu = document.getElementById("sinavGonder");
const kategoriSecimiDiv = document.getElementById("kategoriSecimi");
const kategoriListesi = document.getElementById("kategoriListesi");
const baslaButonu = document.getElementById("baslaButonu");

// Zamanlayıcı oluşturma
const zamanlayiciGoster = document.createElement("div");
zamanlayiciGoster.id = "zamanlayici";
goruntulemeAlani.insertBefore(zamanlayiciGoster, goruntulemeAlani.firstChild);

// Fonksiyonlar
function secimleriSifirla() {
    cevapSecenekleri.forEach(secenek => (secenek.checked = false));
}

function soruGetir() {
    if (sira < seciliSorular.length) {
        secimleriSifirla();
        const siradakiSoru = seciliSorular[sira];

        mevcutSoru.innerText = siradakiSoru.soru;
        aAciklama.innerText = siradakiSoru.secenekA;
        bAciklama.innerText = siradakiSoru.secenekB;
        cAciklama.innerText = siradakiSoru.secenekC;
        dAciklama.innerText = siradakiSoru.secenekD;

        // Eğer ilk soru ise zamanlayıcıyı başlat
        if (sira === 0) {
            zamanlayici = 30; // Süreyi 30 saniye olarak ayarla
            zamanlayiciBaslat();
        }
    } else {
        sinavSonu();
    }
}

function secimiAl() {
    let secim;
    cevapSecenekleri.forEach(secenek => {
        if (secenek.checked) {
            secim = secenek.id;
        }
    });
    return secim;
}

function zamanlayiciBaslat() {
    // Zamanlayıcı göstergesi
    zamanlayiciGoster.innerHTML = `
        <div id="zamanGostergeWrapper" style="position: relative; width: 100%; height: 30px; background-color: #ddd; border-radius: 5px; overflow: hidden;">
            <div id="zamanGosterge" style="width: 100%; height: 100%; background-color: green; transition: width 1s linear;"></div>
        </div>
        <p id="zamanMetni" style="text-align: center; font-size: 18px; margin-top: 5px;">Kalan Süre: ${zamanlayici} saniye</p>
    `;

    clearInterval(zamanlayiciInterval); // Önceki zamanlayıcıyı temizle
    let baslangicZamani = zamanlayici; // Toplam süreyi kaydet
    zamanlayiciInterval = setInterval(() => {
        zamanlayici--;

        // Güncellenen süre metnini ve ilerleme çubuğunu ayarla
        document.getElementById("zamanMetni").innerText = `Kalan Süre: ${zamanlayici} saniye`;
        const kalanYuzde = (zamanlayici / baslangicZamani) * 100;
        const zamanGosterge = document.getElementById("zamanGosterge");
        zamanGosterge.style.width = `${kalanYuzde}%`;

        // Renk geçişi (yeşilden kırmızıya doğru)
        if (zamanlayici <= baslangicZamani / 3) {
            zamanGosterge.style.backgroundColor = "red";
        } else if (zamanlayici <= (baslangicZamani / 3) * 2) {
            zamanGosterge.style.backgroundColor = "orange";
        }

        // Süre bitiminde işlem yap
        if (zamanlayici <= 0) {
            clearInterval(zamanlayiciInterval);
            zamanlayiciGoster.innerHTML = "<p style='color: red; text-align: center; font-size: 18px;'>Süre Doldu!</p>";
            sinavSonu(); // Sınavı bitir
        }

        // Sesli uyarı (son 5 saniyede)
        if (zamanlayici === 5) {
            const uyarıSesi = new Audio("uyari.mp3");
            uyarıSesi.play();
        }
    }, 1000);
}


function sinavSonu() {
    goruntulemeAlani.innerHTML = 
        `<h2>${puan}/${seciliSorular.length} doğru cevapladınız!</h2>
        <button onclick="location.reload()">Yeniden Başla</button>`;
}

function kategoriSecimi(secilenKategori) {
    seciliSorular = sunucudanGelen.sorular.filter(soru => soru.kategori === secilenKategori);

    if (seciliSorular.length > 0) {
        kategoriSecimiDiv.style.display = "none";
        goruntulemeAlani.style.display = "block";
        soruGetir();
    } else {
        alert("Seçilen kategoride soru bulunamadı!");
    }
}

// Olay dinleyiciler
kategoriListesi.querySelectorAll('.kategori').forEach(kategori => {
    kategori.addEventListener("click", function () {
        const secilenKategori = this.getAttribute("data-kategori");
        kategoriSecimi(secilenKategori);
    });
});

gonderButonu.addEventListener("click", () => {
    const secim = secimiAl();
    if (secim) {
        if (secim === seciliSorular[sira].dogruCevap) {
            puan++;
        } else {
            dogruCevabiGoster(); // Yanlış cevap durumunda doğru cevabı göster
        }
        sira++;
        soruGetir(); // Yeni soruyu getir
    } else {
        alert("Lütfen bir cevap seçin!");
    }
});
function dogruCevabiGoster() {
    const siradakiSoru = seciliSorular[sira];
    const mesaj = `Doğru cevap: ${siradakiSoru.dogruCevap}\nSeviye: ${siradakiSoru.seviye}`;
    alert(mesaj);
}


document.querySelectorAll('.kategori').forEach((kategori) => {
    kategori.addEventListener('click', () => {
        // Seçilen kategoriye ait veri-kategori özelliğini al
        const kategoriAdi = kategori.getAttribute('data-kategori');
        
        // Arka planları kategorilere göre değiştir
        const arkaPlanlar = {
            'genel kültür': "url('genelkulturarka.jpg')",
            'programlama': "url('pexels-luis-gomes-166706-546819.jpg')",
            'matematik': "url('matarka2.jpg')",
            'spor': "url('sporarka1.jpg')",
            'coğrafya': "url('cogarka.jpeg')",
            'bilim': "url('bilimarka2.jpg')",
            'tarih': "url('pexels-furkanelveren-26081858.jpg')",
        };
        
        // Varsayılan arka plan
        const varsayilanArkaPlan = "url('varsayilanArka.jpg')";

        // Arka planı değiştir
        const yeniArkaPlan = arkaPlanlar[kategoriAdi] || varsayilanArkaPlan;
        document.body.style.backgroundImage = yeniArkaPlan;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.transition = 'background-image 1s ease-in-out'; // Geçiş efekti

        // Kategori başlığını ekranda göster
        const kategoriBaslik = document.getElementById('kategoriBaslik') || document.createElement('div');
        kategoriBaslik.id = 'kategoriBaslik';
        kategoriBaslik.innerText = `Seçilen Kategori: ${kategoriAdi.toUpperCase()}`;
        kategoriBaslik.style.position = 'absolute';
        kategoriBaslik.style.top = '10px';
        kategoriBaslik.style.left = '10px';
        kategoriBaslik.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        kategoriBaslik.style.color = '#fff';
        kategoriBaslik.style.padding = '10px';
        kategoriBaslik.style.borderRadius = '5px';
        kategoriBaslik.style.fontSize = '18px';
        kategoriBaslik.style.fontFamily = 'Arial, sans-serif';

        if (!document.body.contains(kategoriBaslik)) {
            document.body.appendChild(kategoriBaslik);
        }
    });
});

  