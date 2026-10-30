export interface Pedido {
  id?: number;
  clienteEmail?: string;
  clienteNombre?: string;
  producto: string;
  cantidad: number;
  total?: number;
  estado?: string;
  fechaCreacion?: string;
  comentarioAdmin?: string;
}