// CONFIGURAÇÃO - Insira seu nome de usuário do GitHub aqui
const GITHUB_USERNAME = "SEU_USUARIO_AQUI"; 

document.addEventListener("DOMContentLoaded", () => {
    fetchGitHubRepositories();
});

/**
 * Busca os repositórios públicos do usuário utilizando a Fetch API de forma assíncrona.
 */
async function fetchGitHubRepositories() {
    const container = document.getElementById("projects-container");
    const loadingElement = document.getElementById("loading");

    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9`);
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const repositories = await response.json();

        // Esconde o elemento de loading
        loadingElement.style.display = "none";

        // Caso o usuário não tenha repositórios públicos
        if (repositories.length === 0) {
            container.innerHTML = `<p class="loading">Nenhum repositório público encontrado.</p>`;
            return;
        }

        // Renderiza cada repositório encontrado
        repositories.forEach(repo => {
            // Ignora forks para focar apenas em projetos autorais (opcional)
            if (repo.fork) return; 

            const cardHTML = createProjectCard(repo);
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Erro ao buscar dados do GitHub:", error);
        loadingElement.style.display = "none";
        container.innerHTML = `
            <div class="error-msg">
                <i class="fa-solid fa-triangle-exclamation"></i>
                Não foi possível carregar os projetos no momento.<br>
                Verifique se o nome de usuário do GitHub está configurado corretamente.
            </div>
        `;
    }
}

/**
 * Gera a string HTML estruturada para o Card do Projeto
 */
function createProjectCard(repo) {
    // Trata a descrição caso ela seja nula
    const description = repo.description ? repo.description : "Sem descrição informada no repositório.";
    
    // Trata a linguagem principal do projeto
    const language = repo.language ? repo.language : "Markdown/Outros";

    return `
        <article class="project-card">
            <div class="card-header">
                <i class="fa-regular fa-folder-open"></i>
                <i class="fa-brands fa-github"></i>
            </div>
            <h3>${repo.name}</h3>
            <p>${description}</p>
            <div class="card-footer">
                <span class="lang-tag">${language}</span>
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-link">
                    Ver código <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            </div>
        </article>
    `;
}
