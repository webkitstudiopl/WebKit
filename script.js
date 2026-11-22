document.addEventListener('DOMContentLoaded', () => {
    const toastNotification = document.getElementById('toastNotification');
    let toastTimeout;

    function showToast(htmlMessage, duration = 4200) {
        if (!toastNotification) return;
        toastNotification.innerHTML = htmlMessage;
        toastNotification.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastNotification.classList.remove('show');
        }, duration);
    }

    // 1. Menu mobilne (Hamburger) + zamykanie po kliknięciu poza menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link, .btn-nav');

    function toggleMenu(forceClose = false) {
        if (!navMenu || !hamburger) return;
        const isOpen = forceClose ? false : !navMenu.classList.contains('open');
        navMenu.classList.toggle('open', isOpen);
        hamburger.classList.toggle('is-active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    }

    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('open') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            toggleMenu(true);
        }
    });

    // 2. Zakładka "Przykłady"
    const examplesLink = document.getElementById('examplesLink');
    if (examplesLink) {
        examplesLink.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('🚧 Sekcja <strong>„Przykłady”</strong> jest w przygotowaniu i wkrótce pojawi się na stronie!');
        });
    }

    // 3. Pasek postępu scrolla i przyciemnienie nawigacji
    const scrollProgress = document.getElementById('scrollProgress');
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = `${scrollPercent}%`;
        if (navbar) navbar.classList.toggle('scrolled', scrollTop > 30);
    });

    // 4. Efekt pisania na żywo (Typewriter)
    const typewriterElement = document.getElementById('typewriter');
    const phrases = [
        'przyciągają klientów',
        'wyglądają profesjonalnie',
        'testujesz przed zapłatą',
        'działają na każdym ekranie'
    ];
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let isDeleting = false;

    function typeEffect() {
        if (!typewriterElement) return;
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            charIndex--;
            typewriterElement.textContent = currentPhrase.substring(0, charIndex);
        } else {
            charIndex++;
            typewriterElement.textContent = currentPhrase.substring(0, charIndex);
        }

        let typingSpeed = isDeleting ? 45 : 95;

        if (!isDeleting && charIndex === currentPhrase.length) {
            typingSpeed = 2100;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 350;
        }

        setTimeout(typeEffect, typingSpeed);
    }

    setTimeout(typeEffect, 2100);

    // 5. Wybór wersji (BASIC / STANDARD / PRO) + kalkulator dodatków
    const tierCards = document.querySelectorAll('.tier-card');
    const optionCheckboxes = document.querySelectorAll('.calc-option');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const hiddenTierName = document.getElementById('hiddenTierName');
    const hiddenTotalPrice = document.getElementById('hiddenTotalPrice');
    const hiddenSelectedOptions = document.getElementById('hiddenSelectedOptions');
    const activeTierLabel = document.getElementById('activeTierLabel');
    const activeAddonsCount = document.getElementById('activeAddonsCount');
    const budgetFill = document.getElementById('budgetFill');
    const resetOptionsBtn = document.getElementById('resetOptionsBtn');

    let selectedTier = {
        name: 'BASIC',
        price: 50
    };

    const referenceMaxBudget = 550;

    function updateTotalPrice(animatePrice = true) {
        let total = selectedTier.price;
        let selectedCount = 0;
        const summaryParts = [`Wersja: ${selectedTier.name} (${selectedTier.price} zł)`];

        optionCheckboxes.forEach(checkbox => {
            const parentCard = checkbox.closest('.checkbox-card');
            if (checkbox.checked) {
                if (parentCard) parentCard.classList.add('is-checked');
                selectedCount++;
                const price = parseInt(checkbox.getAttribute('data-price'), 10);
                const label = checkbox.getAttribute('data-label');
                if (!isNaN(price)) total += price;
                if (label) summaryParts.push(label);
            } else if (parentCard) {
                parentCard.classList.remove('is-checked');
            }
        });

        if (totalPriceDisplay) totalPriceDisplay.textContent = `${total} zł`;
        if (hiddenTierName) hiddenTierName.value = `${selectedTier.name} (${selectedTier.price} zł)`;
        if (hiddenTotalPrice) hiddenTotalPrice.value = `${total} zł`;
        if (hiddenSelectedOptions) hiddenSelectedOptions.value = summaryParts.join(' | ');
        if (activeTierLabel) activeTierLabel.textContent = `${selectedTier.name} (${selectedTier.price} zł)`;

        if (activeAddonsCount) {
            activeAddonsCount.textContent = selectedCount === 0
                ? 'Dodatki: brak'
                : `Dodatki: ${selectedCount} ${selectedCount === 1 ? 'opcja' : 'opcje'}`;
        }

        if (budgetFill) {
            const fillPercent = Math.min(100, Math.max(10, Math.round((total / referenceMaxBudget) * 100)));
            budgetFill.style.width = `${fillPercent}%`;
        }

        if (resetOptionsBtn) {
            resetOptionsBtn.hidden = selectedCount === 0;
        }

        if (animatePrice && totalPriceDisplay) {
            totalPriceDisplay.style.transform = 'scale(1.1)';
            setTimeout(() => {
                totalPriceDisplay.style.transform = 'scale(1)';
            }, 180);
        }
    }

    tierCards.forEach(card => {
        card.addEventListener('click', () => {
            tierCards.forEach(c => c.classList.remove('is-selected'));
            card.classList.add('is-selected');

            selectedTier = {
                name: card.getAttribute('data-tier') || 'BASIC',
                price: parseInt(card.getAttribute('data-tier-price'), 10) || 50
            };

            updateTotalPrice(true);
            showToast(`👑 Wybrano wersję <strong>${selectedTier.name}</strong> (${selectedTier.price} zł).`);
        });
    });

    optionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => updateTotalPrice(true));
    });

    if (resetOptionsBtn) {
        resetOptionsBtn.addEventListener('click', () => {
            optionCheckboxes.forEach(cb => { cb.checked = false; });
            updateTotalPrice(true);
            showToast(`🧹 Wyczyszczono dodatki – zostaje wersja <strong>${selectedTier.name}</strong>.`);
        });
    }

    updateTotalPrice(false);

    // 6. Obsługa wysyłki formularza (formsubmit.cloud)
    const orderForm = document.getElementById('orderForm');
    const submitBtn = document.getElementById('submitBtn');
    const localWarning = document.getElementById('localWarning');

    const isLocalFile = window.location.protocol === 'file:';
    if (isLocalFile && localWarning) {
        localWarning.hidden = false;
    }

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            if (isLocalFile) {
                e.preventDefault();
                showToast('⚠️ Plik otwarty lokalnie (<code>file://</code>). Otwórz stronę ze skonfigurowanego adresu z <em>Allowed Origins</em> w <strong>formsubmit.cloud</strong>!', 6000);
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Przekierowanie do weryfikacji i wysyłka... ⏳</span>';
            }
        });
    }

    // 7. Akordeon FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (!questionBtn) return;
        questionBtn.addEventListener('click', () => {
            const wasOpen = item.classList.contains('open');
            faqItems.forEach(other => other.classList.remove('open'));
            if (!wasOpen) {
                item.classList.add('open');
            }
        });
    });

    // 8. Kopiowanie adresu e-mail w stopce
    const copyMailBtn = document.getElementById('copyMailBtn');
    if (copyMailBtn) {
        copyMailBtn.addEventListener('click', async () => {
            const email = 'webkitstudio.pl@gmail.com';
            try {
                await navigator.clipboard.writeText(email);
                showToast(`📋 Skopiowano adres <strong>${email}</strong> do schowka!`);
            } catch {
                showToast(`📧 Nasz e-mail: <strong>${email}</strong>`);
            }
        });
    }

    // 9. Subtelna poświata pod kursorem na kartach
    const glowCards = document.querySelectorAll('.glow-card');
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // 10. Animacje pojawiania się przy scrollu (Scroll Reveal)
    const revealElements = document.querySelectorAll('.reveal');

    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 80) {
                el.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
});