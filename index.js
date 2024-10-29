const express = require("express")
const app = express()
const path = require("path")
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { testConnection, syncModels } = require("./config/db");
const { Product } = require("./models/product");
const { title } = require("process");
const multer = require("multer")
require("./models/index")

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Dosyaların kaydedileceği dizin
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Dosya adını oluştur
    }
});
const upload = multer({ storage: storage });

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 900000 } // 9 dakika (900,000 milisaniye)
}));


app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.locals.session = req.session; // Session'ı res.locals'a ekle
    next(); // İsteği bir sonraki middleware'e geçir
});

// Basit ürün listesi
const products = [
    { id: 1, name: "Ürün 1", price: 100 },
    { id: 2, name: "Ürün 2", price: 200 },
];


function requireAuth(req, res, next) {
    console.log("reqq", req.session)
    if (req.session?.username) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

const data = {
    title: 'Express ve EJS',
    message: 'Bu bir veri nesnesidir.'
};

// Kök dizine yapılan GET isteğine yanıt verilmesi
app.get('/', async (req, res) => {
    try {
        const products = await Product.findAll(); // Tüm ürünleri veritabanından al
        res.render('home', { products , title : "ürünler" }); // products.ejs sayfasına ürünleri gönder
    } catch (error) {
        console.error('Ürünleri getirirken hata oluştu:', error);
        res.status(500).send('Bir hata oluştu');
    }
});


// 1. Ürünlerin gösterildiği sayfa (herkese açık)
app.get('/products', (req, res) => {
    res.render('products', { products });
});
app.get("/urunekle", (req, res) => {
    res.render("createProduct", {
        title: "Ürün Ekle"
    })
})

// 2. Login sayfası - GET ve POST rotaları
app.post('/login', (req, res) => {
    const validUsername = 'admin';
    const validPassword = '123';
    console.log("reqi", req.bo)
    const { username, password } = req.body;
    // Kullanıcı adı ve şifre kontrolü
    if (username === validUsername && password === validPassword) {
        req.session.username = username; // Giriş başarılıysa kullanıcı adını session'a kaydet
        return res.redirect('/admin'); // Giriş başarılıysa admin sayfasına yönlendir
    }
    else {
        res.redirect('/login');
    }
    // Giriş başarısızsa login s    ayfasına geri yönlendir

});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});
// 3. Admin sayfası (sadece yetkili kullanıcılar)
app.get('/admin', requireAuth, async (req, res) => {
    const prodList = await Product.findAll()
    res.render('admin', { username: 'admin', title: "testbabacım", products: prodList });
});

app.post('/add-product', upload.single('image'), async (req, res) => {
    const { name, price, description } = req.body;

    // İsim kontrolü
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Ürün adı boş bırakılamaz.' });
    }

    // Fiyat kontrolü
    if (!price || parseFloat(price) <= 0) {
        return res.status(400).json({ error: 'Fiyat 0\'dan büyük olmalıdır.' });
    }

    // Açıklama kontrolü
    if (!description || description.trim() === '') {
        return res.status(400).json({ error: 'Açıklama boş bırakılamaz.' });
    }

    // Fotoğrafın yüklendiğini kontrol et
    if (!req.file) {
        return res.status(400).json({ error: 'Lütfen bir fotoğraf yükleyin.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`; // Yüklenen dosyanın URL'si

    // Yeni ürünü oluştur
    await Product.create({ name, price, description, imageUrl });

    // Ürün ekleme işlemi tamamlandıktan sonra bir yönlendirme yapabilirsiniz
    res.redirect('/admin'); // Admin sayfasına yönlendirme
});

app.get('/urun/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).send('Ürün bulunamadı.');
        }

        res.render('product', { product, title: "güncelle" }); // Ürün güncelleme sayfasını render et
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).send('Sunucu hatası.');
    }
});

// Ürün güncelleme işlemi
app.post('/product/update/:id', upload.single('image'), async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).send('Ürün bulunamadı.');
        }

        // Form verilerini güncelle
        const { name, price, description } = req.body;

        // Kontroller
        if (!name || price <= 0 || !description) {
            return res.status(400).send('Ürün adı boş olamaz, fiyat 0\'dan büyük olmalı ve açıklama boş bırakılamaz.');
        }

        product.name = name;
        product.price = parseFloat(price);
        product.description = description;

        // Eğer yeni bir görsel yüklenmişse, mevcut görseli güncelle
        if (req.file) {
            product.imageUrl = `/uploads/${req.file.filename}`;
        }

        await product.save(); // Değişiklikleri kaydet
        res.redirect('/admin'); // Ürünler sayfasına yönlendir
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).send('Sunucu hatası.');
    }
});

app.post('/product/delete/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).send('Ürün bulunamadı.');
        }

        await product.destroy(); // Ürünü sil
        res.redirect('/admin'); // Ürünler sayfasına yönlendir
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).send('Sunucu hatası.');
    }
});


// Çıkış yapma
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});





app.listen(4242, async () => {
    await testConnection()
    await syncModels()
    console.log("server is running")
})