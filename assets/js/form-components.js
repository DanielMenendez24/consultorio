/**
 * Initializes a searchable select (combo-box) component.
 * @param {string} containerId - The ID of the .searchable-select container.
 */
function initSearchableSelect(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const input = container.querySelector('.search-input');
    const list = container.querySelector('.options-list');
    const hiddenSelect = container.querySelector('select');
    const options = Array.from(list.querySelectorAll('.option-item'));

    // --- State ---
    let isOpen = false;

    // --- Helpers ---
    const showList = () => {
        container.classList.add('is-open');
        isOpen = true;
    };

    const hideList = () => {
        container.classList.remove('is-open');
        isOpen = false;
    };

    const filterOptions = (query) => {
        const term = query.toLowerCase().trim();
        let hasResults = false;

        options.forEach(opt => {
            const text = opt.textContent.toLowerCase();
            if (text.includes(term)) {
                opt.style.display = 'block';
                hasResults = true;
            } else {
                opt.style.display = 'none';
            }
        });

        // Show/hide "No results" message if it exists
        const noResultsMsg = container.querySelector('.no-results');
        if (noResultsMsg) {
            noResultsMsg.style.display = hasResults ? 'none' : 'block';
        }
    };

    const selectOption = (opt) => {
        const value = opt.getAttribute('data-value');
        const text = opt.textContent;

        // Update visual state
        input.value = text;
        options.forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');

        // Sync with hidden select
        hiddenSelect.value = value;

        // Trigger change event for validation or other listeners
        hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));

        hideList();
    };

    // --- Event Listeners ---
    input.addEventListener('focus', () => {
        showList();
        filterOptions(input.value);
    });

    input.addEventListener('input', () => {
        if (!isOpen) showList();
        filterOptions(input.value);
    });

    // Option click
    list.addEventListener('mousedown', (e) => {
        const opt = e.target.closest('.option-item');
        if (opt) {
            selectOption(opt);
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            hideList();
        }
    });

    // Sync initial value if any
    if (hiddenSelect.value) {
        const initialOpt = options.find(o => o.getAttribute('data-value') === hiddenSelect.value);
        if (initialOpt) {
            input.value = initialOpt.textContent;
            initialOpt.classList.add('is-selected');
        }
    }
}
