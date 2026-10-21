document.addEventListener('DOMContentLoaded', () => {
    // सभी आवश्यक DOM Elements
    const viewToggleBtn = document.getElementById('view-toggle-btn');
    const productsWrapper = document.getElementById('products-wrapper');
    const productCards = document.querySelectorAll('.product-card');
    const searchBox = document.getElementById('search-box');
    const companyCheckboxes = document.querySelectorAll('.company-select');
    const productCheckboxes = document.querySelectorAll('.product-select-checkbox');
    const selectedCountSpan = document.getElementById('selected-count');
    
    // नए Elements (कैटेगरी और बटन्स के लिए)
    const categoryLinks = document.querySelectorAll('.category-link');
    const btnXlsx = document.querySelector('.btn-xlsx');
    const btnWhatsapp = document.querySelector('.btn-whatsapp');

    // एक्टिव कैटेगरी को ट्रैक करने के लिए वेरिएबल
    let activeCategory = 'show all';

    // 1. 🔄 लेआउट टॉगल लॉजिक (Grid / List View Switch)
    if (viewToggleBtn && productsWrapper) {
        viewToggleBtn.addEventListener('click', () => {
            const isListMode = productsWrapper.classList.toggle('list-mode');
            viewToggleBtn.textContent = isListMode ? 'Switch to Grid View' : 'Switch to List View';
        });
    }

    // 2. 🔢 सिलेक्टेड प्रोडक्ट्स काउंटर लॉजिक
    function updateCounter() {
        const checkedCount = document.querySelectorAll('.product-select-checkbox:checked').length;
        if (selectedCountSpan) selectedCountSpan.textContent = checkedCount;
    }
    productCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCounter);
    });

    // 3. 🔍 मास्टर फ़िल्टर लॉजिक (सर्च + कंपनी + कैटेगरी तीनों एक साथ)
    function filterProducts() {
        const searchTerm = searchBox.value.toLowerCase().trim();
        
        // एक्टिव कंपनीज की लिस्ट
        const activeCompanies = Array.from(companyCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.nextElementSibling.textContent.toLowerCase().trim());

        productCards.forEach(card => {
            const brandName = card.querySelector('.brand-name').textContent.toLowerCase();
            const cardBodyText = card.querySelector('.card-body').textContent.toLowerCase();
            
            // कस्टमाइज्ड कंपनी मैपिंग लॉजिक
            let matchesCompany = false;
            activeCompanies.forEach(company => {
                if (brandName.includes(company) || company.includes(brandName) || 
                    (company === "johnson & johnson" && brandName.includes("monocryl")) ||
                    (company === "healthium" && brandName.includes("truglyde")) ||
                    (company === "meril life" && brandName.includes("meril")) ||
                    (company === "lotus surgical" && brandName.includes("mendil"))) {
                    matchesCompany = true;
                }
            });

            // सर्च कीवर्ड मैचिंग
            const matchesSearch = brandName.includes(searchTerm) || cardBodyText.includes(searchTerm);

            // कैटेगरी मैचिंग लॉजिक (कार्ड के डेटा के आधार पर)
            let matchesCategory = false;
            if (activeCategory === 'show all') {
                matchesCategory = true;
            } else if (activeCategory === 'surgical sutures' && 
                       (brandName.includes('monocryl') || brandName.includes('truglyde') || brandName.includes('mitsu'))) {
                matchesCategory = true;
            } else if (activeCategory === 'analgesics' && brandName.includes('meril')) {
                // उदाहरण के लिए Meril Suture A को Analgesics माना है, आप अपने अनुसार बदल सकते हैं
                matchesCategory = true;
            } else if (activeCategory === 'gastro' && brandName.includes('mendil')) {
                // उदाहरण के लिए Mendil Fix (Pantoprazole) को Gastro माना है
                matchesCategory = true;
            }

            // तीनों कंडीशन्स पूरी होने पर ही कार्ड दिखेगा
            if (matchesCompany && matchesSearch && matchesCategory) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    }

    // 4. 🗂️ कैटेगरी चेंज इवेंट्स (Show All और बाकी लिस्ट)
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // एक्टिव क्लास को रीसेट और अप्लाई करना
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // चुनी हुई कैटेगरी सेट करें और फ़िल्टर चलाएं
            activeCategory = link.textContent.toLowerCase().trim();
            filterProducts();
        });
    });

    // सर्च और कंपनी चेकबॉक्स पर फ़िल्टर इवेंट्स
    if (searchBox) searchBox.addEventListener('input', filterProducts);
    companyCheckboxes.forEach(checkbox => checkbox.addEventListener('change', filterProducts));


    // 5. 💾 PC Save Button (.XLSX) लॉजिक
    if (btnXlsx) {
        btnXlsx.addEventListener('click', () => {
            const selectedCards = document.querySelectorAll('.product-select-checkbox:checked');
            
            if (selectedCards.length === 0) {
                alert('कृपया डाउनलोड करने के लिए कम से कम एक प्रोडक्ट सेलेक्ट करें!');
                return;
            }

            // CSV/Excel डेटा तैयार करना
            let csvContent = "data:text/csv;charset=utf-8,Brand,Details,Price\n";
            
            selectedCards.forEach(cb => {
                const card = cb.closest('.product-card');
                const brand = card.querySelector('.brand-name').textContent;
                const price = card.querySelector('.product-price').textContent.replace(/[^0-9]/g, '');
                
                csvContent += `"${brand}","Selected Product", "INR ${price}"\n`;
            });

            // फ़ाइल डाउनलोड ट्रिगर करना
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "selected_products.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // 6. 🟢 Share on WhatsApp लॉजिक
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', () => {
            const selectedCards = document.querySelectorAll('.product-select-checkbox:checked');
            
            if (selectedCards.length === 0) {
                alert('व्हाट्सएप पर शेयर करने के लिए कम से कम एक प्रोडक्ट सेलेक्ट करें!');
                return;
            }

            // मैसेज का टेक्स्ट फॉर्मेट बनाना
            let messageText = "*Selected Products List:*\n\n";
            
            selectedCards.forEach((cb, index) => {
                const card = cb.closest('.product-card');
                const brand = card.querySelector('.brand-name').textContent;
                const price = card.querySelector('.product-price').textContent;
                messageText += `${index + 1}. *${brand}* - Price: ${price}\n`;
            });

            // व्हाट्सएप यूआरएल ओपन करना
            const whatsappUrl = `https://whatsapp.com{encodeURIComponent(messageText)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
});
