export const ROTAS = {
  INICIAL: '/',
  BEMVINDO: '/bemvindo',
  PROJETOS: '/projetos',
  SEUS_PROJETOS_LEGADO: '/projetos/seus-projetos',
  NOVO_PROJETO: '/projetos/novo',
  CADASTRAR_PROJETO_LEGADO: '/projetos/cadastrar-projeto',
  ESQUECI_SENHA: '/esqueci-senha',
  REDEFINIR_SENHA: '/redefinir-senha',
  editarProjeto: (id) => `/projetos/${id}/editar`,
  imprimirProjeto: (id) => `/projetos/${id}/imprimir`,
};
