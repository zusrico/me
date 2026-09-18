(() => {
	const root = document.documentElement;
	const toggle = document.querySelector('.theme-toggle');
	const storedTheme = localStorage.getItem('theme');

	if (storedTheme === 'dark') {
		root.dataset.theme = 'dark';
	}

	if (!toggle) {
		return;
	}

	const updateLabel = () => {
		const isDark = root.dataset.theme === 'dark';
		toggle.textContent = isDark ? 'light mode' : 'dark mode';
		toggle.setAttribute('aria-pressed', String(isDark));
	};

	toggle.addEventListener('click', () => {
		const isDark = root.dataset.theme === 'dark';

		if (isDark) {
			delete root.dataset.theme;
			localStorage.setItem('theme', 'light');
		} else {
			root.dataset.theme = 'dark';
			localStorage.setItem('theme', 'dark');
		}

		updateLabel();
	});

	updateLabel();
})();
