const GITHUB_USERNAME = "Bernardopmtld";
const MAX_PROJECTS = 9;
const FALLBACK_PROJECTS = [
    {
        name: "Portifuliohub",
        description: "Plataforma centralizada para exibição e gerenciamento de projetos e portfólios digitais, integrada com a API do GitHub.",
        language: "CSS",
        html_url: "https://github.com/Bernardopmtld/Portifuliohub",
        updated_at: "2026-05-25T00:00:00Z"
    },
    {
        name: "equitrackervercel",
        description: "Aplicação web para acompanhamento de dados e organização de informações em tempo real.",
        language: "JavaScript",
        html_url: "https://github.com/Bernardopmtld/equitrackervercel",
        updated_at: "2026-05-24T00:00:00Z"
    },
    {
        name: "equitracker",
        description: "Projeto em JavaScript focado em monitoramento, controle e visualização de registros.",
        language: "JavaScript",
        html_url: "https://github.com/Bernardopmtld/equitracker",
        updated_at: "2026-05-22T00:00:00Z"
    },
    {
        name: "Personalportfoliowebsite",
        description: "Portfólio pessoal desenvolvido para apresentar experiência, projetos e presença profissional.",
        language: "TypeScript",
        html_url: "https://github.com/Bernardopmtld/Personalportfoliowebsite",
        updated_at: "2026-05-14T00:00:00Z"
    },
    {
        name: "flappy-bird-python",
        description: "Clone minimalista de Flappy Bird feito com Python e Pygame, sem depender de assets externos.",
        language: "Python",
        html_url: "https://github.com/Bernardopmtld/flappy-bird-python",
        updated_at: "2026-05-08T00:00:00Z"
    },
    {
        name: "Bernardopmtld",
        description: "Repositório de perfil com informações e experimentos do ecossistema GitHub.",
        language: "Python",
        html_url: "https://github.com/Bernardopmtld/Bernardopmtld",
        updated_at: "2026-04-05T00:00:00Z"
    }
];
const FALLBACK_PROFILE = {
    public_repos: FALLBACK_PROJECTS.length,
    followers: 1,
    updated_at: "2026-05-25T00:00:00Z"
};

document.addEventListener("DOMContentLoaded", () => {
    loadPortfolio();
});

async function loadPortfolio() {
    const projectsContainer = document.getElementById("projects-container");
    const loadingElement = document.getElementById("loading");

    try {
        const [profileResult, repositoriesResult] = await Promise.allSettled([
            fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}`),
            fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`)
        ]);

        renderProfile(profileResult.status === "fulfilled" ? profileResult.value : FALLBACK_PROFILE);

        const repositories = repositoriesResult.status === "fulfilled"
            ? repositoriesResult.value
            : FALLBACK_PROJECTS;

        const projects = normalizeProjects(repositories);

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
        renderFallbackProjects(projectsContainer);
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
    const bio = document.getElementById("profile-bio");
    const reposStat = document.querySelector('[data-stat="repos"]');
    const followersStat = document.querySelector('[data-stat="followers"]');
    const updatedStat = document.querySelector('[data-stat="updated"]');

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

function normalizeProjects(repositories) {
    return repositories
        .filter((repo) => !repo.fork)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, MAX_PROJECTS);
}

function renderFallbackProjects(container) {
    container.innerHTML = "";
    normalizeProjects(FALLBACK_PROJECTS).forEach((repo) => {
        container.insertAdjacentHTML("beforeend", createProjectCard(repo));
    });
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
