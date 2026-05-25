const GITHUB_USERNAME = "Bernardopmtld";
const MAX_PROJECTS = 9;

document.addEventListener("DOMContentLoaded", () => {
    loadPortfolio();
});

async function loadPortfolio() {
    const projectsContainer = document.getElementById("projects-container");
    const loadingElement = document.getElementById("loading");

    try {
        const [profile, repositories] = await Promise.all([
            fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}`),
            fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`)
        ]);

        renderProfile(profile);

        const projects = repositories
            .filter((repo) => !repo.fork)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, MAX_PROJECTS);

        loadingElement.hidden = true;
        projectsContainer.innerHTML = "";

        if (!projects.length) {
            projectsContainer.innerHTML = '<div class="status-message">Nenhum repositório público encontrado.</div>';
            return;
        }

        projects.forEach((repo) => {
            projectsContainer.insertAdjacentHTML("beforeend", createProjectCard(repo));
        });
    } catch (error) {
        console.error("Erro ao carregar dados do GitHub:", error);
        loadingElement.hidden = true;
        projectsContainer.innerHTML = `
            <div class="error-message">
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                Não foi possível carregar os projetos agora. Tente novamente em alguns instantes.
            </div>
        `;
    }
}

async function fetchJson(url) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json"
        }
    });

    if (!response.ok) {
        throw new Error(`GitHub API respondeu com status ${response.status}`);
    }

    return response.json();
}

function renderProfile(profile) {
    const avatar = document.getElementById("profile-avatar");
    const bio = document.getElementById("profile-bio");
    const reposStat = document.querySelector('[data-stat="repos"]');
    const followersStat = document.querySelector('[data-stat="followers"]');
    const updatedStat = document.querySelector('[data-stat="updated"]');

    if (avatar && profile.avatar_url) {
        avatar.src = profile.avatar_url;
    }

    if (bio && profile.bio) {
        bio.textContent = profile.bio;
    }

    if (reposStat) {
        reposStat.textContent = formatNumber(profile.public_repos || 0);
    }

    if (followersStat) {
        followersStat.textContent = formatNumber(profile.followers || 0);
    }

    if (updatedStat && profile.updated_at) {
        updatedStat.textContent = new Intl.DateTimeFormat("pt-BR", {
            month: "short",
            year: "numeric"
        }).format(new Date(profile.updated_at));
    }
}

function createProjectCard(repo) {
    const description = repo.description || "Projeto público disponível no GitHub para consulta, evolução e acompanhamento.";
    const language = repo.language || "Repositório";
    const updatedAt = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(repo.updated_at));

    return `
        <article class="project-card" role="listitem">
            <div class="card-header">
                <span class="repo-icon"><i class="fa-regular fa-folder-open" aria-hidden="true"></i></span>
                <span class="repo-date">${updatedAt}</span>
            </div>
            <h3>${escapeHtml(repo.name)}</h3>
            <p>${escapeHtml(description)}</p>
            <div class="card-footer">
                <span class="lang-tag">${escapeHtml(language)}</span>
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-link">
                    Ver código <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                </a>
            </div>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR", {
        notation: value >= 1000 ? "compact" : "standard"
    }).format(value);
}
