import { toast } from 'react-toastify';

interface User {
  id: number;
  name: string;
  email: string;
  department: { id: number, name: string };
  roles: { id: number, name: string }[];
  is_active: 1 | 0;
}

let mockUsers: User[] = [
  {
    id: 1, name: 'Ana Carolina (Mock)', email: 'ana.oliveira@minasul.com.br',
    department: { id: 1, name: 'RECURSOS HUMANOS' },
    roles: [{ id: 2, name: 'USER' }],
    is_active: 1
  },
  {
    id: 2, name: 'Bruno Guimarães (Mock)', email: 'bruno.guimaraes@minasul.com.br',
    department: { id: 2, name: 'TI' },
    roles: [{ id: 1, name: 'ADMIN' }],
    is_active: 1
  },
  {
    id: 3, name: 'Carlos Pereira (Mock)', email: 'carlos.pereira@minasul.com.br',
    department: { id: 3, name: 'COMERCIAL' },
    roles: [{ id: 2, name: 'USER' }],
    is_active: 0
  },
  {
    id: 4, name: 'Daniela Martins (Mock)', email: 'daniela.martins@minasul.com.br',
    department: { id: 4, name: 'FINANCEIRO' },
    roles: [{ id: 2, name: 'USER' }],
    is_active: 1
  },
  {
    id: 5, name: 'Eduardo Costa (Mock)', email: 'eduardo.costa@minasul.com.br',
    department: { id: 2, name: 'TI' },
    roles: [{ id: 1, name: 'ADMIN' }],
    is_active: 0
  }
];

// Mock para a lista de departamentos
const mockDepartments = [
    { id: 1, name: 'RECURSOS HUMANOS' },
    { id: 2, name: 'TI' },
    { id: 3, name: 'COMERCIAL' },
    { id: 4, name: 'FINANCEIRO' },
];

const mockApi = {
  get: async (url: string) => {
    console.log(`%c[MOCK API] GET: ${url}`, 'color: #7fdbff');
    await new Promise(resolve => setTimeout(resolve, 500));

    if (url.startsWith('/users/')) {
      const id = parseInt(url.split('/')[2]);
      const user = mockUsers.find(u => u.id === id);
      return Promise.resolve({ data: user });
    }

    if (url.startsWith('/users')) {
      return Promise.resolve({
        data: {
          data: mockUsers,
          current_page: 1,
          last_page: 1,
          total: mockUsers.length
        }
      });
    }

    if (url.startsWith('/departments')) {
        return Promise.resolve({ data: mockDepartments });
    }

    if (url === '/me') {
      return Promise.resolve({ data: mockUsers.find(u => u.roles.some(r => r.name === 'ADMIN')) });
    }

    return Promise.reject({ message: `Rota GET ${url} não encontrada no mock` });
  },

  post: async (url: string, payload: any) => {
    console.log(`%c[MOCK API] POST: ${url}`, 'color: #f0c674', payload);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (url === '/login') {
      if (payload.email && payload.password) {
        const fakeToken = 'fake-jwt-token-for-mock-development-' + Math.random();
        return Promise.resolve({ data: { token: fakeToken } });
      } else {
        return Promise.reject({
          response: {
            data: { message: 'Email e senha são obrigatórios (Mock)' }
          }
        });
      }
    }

    if (url === '/logout') {
        return Promise.resolve({ data: { message: 'Logout mock bem-sucedido' } });
    }

    if (url === '/request-password-reset') {
      toast.success(`(Mock) Link de recuperação enviado para ${payload.email}`);
      return Promise.resolve({ data: { success: true } });
    }

    return Promise.reject({ message: `Rota POST ${url} não encontrada no mock` });
  },

  patch: async (url: string, payload: any) => {
    console.log(`%c[MOCK API] PATCH: ${url}`, 'color: #f0c674', payload);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (url.includes('/active')) {
      const id = parseInt(url.split('/')[2]);
      mockUsers = mockUsers.map(user =>
        user.id === id ? { ...user, is_active: payload.is_active } : user
      );
      return Promise.resolve({ data: { success: true } });
    }

    return Promise.reject({ message: `Rota PATCH ${url} não encontrada no mock` });
  },

  put: async (url: string, payload: any) => {
    console.log(`%c[MOCK API] PUT: ${url}`, 'color: #f0c674', payload);
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve({ data: { success: true, ...payload } });
  },

  delete: async (url: string) => {
    console.log(`%c[MOCK API] DELETE: ${url}`, 'color: #ff6b6b');
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve({ data: { success: true } });
  },
};

export default mockApi;
