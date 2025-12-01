const API = {

  delay: () => new Promise(resolve =>
    setTimeout(resolve, Math.random() * 300 + 200)
  ),

  // GET: Buscar todos os produtos
  async getProducts() {
    await this.delay();

    let products = localStorage.getItem("products");

    if (!products) {
      const response = await fetch("produtos.json");

      if (!response.ok) {
        console.error("Erro ao carregar produtos.json");
        return [];
      }

      const dados = await response.json();

      const convertidos = dados.produtos.map(p => ({
        id: Number(p.id),
        image: p.imagem,
        name: p.nome,
        category: p.categoria,
        description: p.descricao,
        price: Number(p.preco),
        stock: Number(p.estoque)
      }));

      localStorage.setItem("products", JSON.stringify(convertidos));
      return convertidos;
    }

    return JSON.parse(products);
  },

  // GET: Buscar produto por id
  async getProduct(id) {
    await this.delay();
    const products = await this.getProducts();
    return products.find(p => p.id === Number(id));
  },

  // Criar
  async createProduct(product) {
    await this.delay();
    const products = await this.getProducts();

    const newId =
      products.length > 0
        ? Math.max(...products.map(p => p.id)) + 1
        : 1;

    const novo = { ...product, id: newId };
    products.push(novo);

    localStorage.setItem("products", JSON.stringify(products));
    return novo;
  },

  // Atualizar
  async updateProduct(id, updatedProduct) {
    await this.delay();
    const products = await this.getProducts();

    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Produto não encontrado");

    products[index] = { ...updatedProduct, id };

    localStorage.setItem("products", JSON.stringify(products));
    return products[index];
  },

  // Deletar
  async deleteProduct(id) {
    await this.delay();
    const products = await this.getProducts();

    const filtrados = products.filter(p => p.id !== id);

    if (filtrados.length === products.length) {
      throw new Error("Produto não encontrado");
    }

    localStorage.setItem("products", JSON.stringify(filtrados));
    return { success: true, deletedId: id };
  }
};
