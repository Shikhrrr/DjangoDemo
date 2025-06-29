document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value;
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    if (query.trim() === '') return;

    fetch(`/tweet/ajax/search-users/?q=${query}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(user => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex align-items-center py-3';

                const img = document.createElement('img');
                img.src = user.profile_image || "{% static '/images/deafult_profile.png' %}";
                img.className = 'rounded-circle me-3';
                img.width = 50;
                img.height = 50;

                const link = document.createElement('a');
                link.href = `/tweet/user/${user.username}/`;
                link.textContent = `@${user.username}`;
                link.className = 'text-decoration-none text-light fw-medium';

                li.appendChild(img);
                li.appendChild(link);
                resultsContainer.appendChild(li);
            });
        });
});