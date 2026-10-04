// Centraliza os caminhos do frontend para evitar strings espalhadas.
// Convenção: minúsculas + kebab-case. O react-router v7 compara
// sem case-sensitive por padrão, então URLs antigas com maiúscula
// (/Bemvindo, /Projetos/...) continuam caindo nas rotas novas.
export const ROTAS = {
  INICIAL: '/',
  BEMVINDO: '/bemvindo',
  PROJETOS: '/projetos',
  // Rota legada eliminada: antes existiam /Bemvindo e /Projetos/SeusProjetos
  // mostrando a mesma lista. O canônico agora é BEMVINDO.
  SEUS_PROJETOS_LEGADO: '/projetos/seus-projetos',
  NOVO_PROJETO: '/projetos/novo',
  // Legado: antes era /Projetos/CadastrarProjeto.
  CADASTRAR_PROJETO_LEGADO: '/projetos/cadastrar-projeto',
  editarProjeto: (id) => `/projetos/${id}/editar`,
  imprimirProjeto: (id) => `/projetos/${id}/imprimir`,
};
