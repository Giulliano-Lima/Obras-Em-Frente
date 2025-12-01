let editingProductId = null;
 
// Aguarda o DOM estar pronto
$(document).ready(function() {
  loadProducts();
  setupEventListeners();
});
 
// Configura todos os event listeners
function setupEventListeners() {
  // Submit do formulário
  $('#productForm').on('submit', handleFormSubmit);
  
  // Busca em tempo real
  $('#searchInput').on('keyup', handleSearch);
  
  // Limpa formulário ao fechar modal
  $('#productModal').on('hidden.bs.modal', resetForm);
}

// Carrega e exibe todos os produtos
async function loadProducts() {
  try {
    // Mostra loading
    showLoading();
    
    // Busca produtos da API
    const products = await API.getProducts();
    
    // Renderiza na tabela
    renderProducts(products);
    
  } catch (error) {
    showError('Erro ao carregar produtos: ' + error.message);
  } finally {
    hideLoading();
  }
}
 
function showLoading() {
  $('#productTableBody').html(`
    <tr>
      <td colspan="8" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </td>
    </tr>
  `);
}

function hideLoading() {
}

function renderProducts(products) {
  const tbody = $('#productTableBody');
  
  // Limpa tabela
  tbody.empty();
  
  // Verifica se há produtos
  if (products.length === 0) {
    tbody.html(`
      <tr>
        <td colspan="8" class="text-center text-muted">
          Nenhum produto cadastrado
        </td>
      </tr>
    `);
    return;
  }
  
  // Renderiza cada produto
  products.forEach(product => {
    const row = createProductRow(product);
    tbody.append(row);
  });
}

function createProductRow(product) {
  return $(`
    <tr data-product-id="${product.id}">
      <td>${product.id}</td>
      <td>
        <img src="${product.image}" alt="${product.name}" style="width: 50px; height: auto;">
      </td>
      <td>${product.name}</td>
      <td><span class="badge bg-info">${product.category}</span></td>
      <td>${product.description}</td>
      <td>R$ ${parseFloat(product.price).toFixed(2)}</td>
      <td>
        <span class="badge ${product.stock > 10 ? 'bg-success' : 'bg-warning'}">
          ${product.stock}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
            <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Valida formulário
  if (!this.checkValidity()) {
    e.stopPropagation();
    $(this).addClass('was-validated');
    return;
  }
  
  // Coleta dados do formulário
  const productData = {
    image: $('#productImageLink').val(),
    name: $('#productName').val(),
    category: $('#productCategory').val(),
    description: $('#productDescription').val(),
    price: parseFloat($('#productPrice').val()),
    stock: parseInt($('#productStock').val())
  };
 
  try {
    if (editingProductId) {
      // Atualiza produto existente
      await API.updateProduct(editingProductId, productData);
      showSuccess('Produto atualizado com sucesso!');
    } else {
      // Cria novo produto
      await API.createProduct(productData);
      showSuccess('Produto criado com sucesso!');
    }
    // Recarrega lista de produtos
    await loadProducts();
    
    // Fecha modal (assumindo que você tem jQuery ou Bootstrap JS carregado)
    $('#productModal').modal('hide');
    
  } catch (error) {
    showError('Erro ao salvar produto: ' + error.message);
  }
}

async function editProduct(id) {
  try {
    // Busca produto da API
    const product = await API.getProduct(id);
    
    if (!product) {
      showError('Produto não encontrado');
      return;
    }
    
    // Preenche formulário
    editingProductId = id;
    $('#modalTitle').text('Editar Produto');
    $('#productImageLink').val(product.image);
    $('#productName').val(product.name); 
    $('#productCategory').val(product.category);
    $('#productDescription').val(product.description);
    $('#productPrice').val(product.price);
    $('#productStock').val(product.stock);
    
    // Abre modal
    $('#productModal').modal('show');
    
  } catch (error) {
    showError('Erro ao carregar produto: ' + error.message);
  }
}

async function deleteProduct(id) {
  // Confirmação do usuário
  if (!confirm('Deseja realmente excluir este produto?')) {
    return;
  }
 
  try {
    // Remove produto via API
    await API.deleteProduct(id);
    
    // Animação de remoção
    $(`tr[data-product-id="${id}"]`).fadeOut(300, async function() {
      $(this).remove();
      showSuccess('Produto excluído com sucesso!');
    });
    
  } catch (error) {
    showError('Erro ao excluir produto: ' + error.message);
  }
}

async function handleSearch() {
  const searchTerm = $(this).val().toLowerCase();
  
  try {
    // Busca todos os produtos
    const products = await API.getProducts();
    
    // Filtra produtos
    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.id.toString().includes(searchTerm)
    );
    
    // Renderiza resultados filtrados
    renderProducts(filteredProducts);
    
  } catch (error) {
    showError('Erro na busca: ' + error.message);
  }
}

function resetForm() {
  // Reseta ID de edição
  editingProductId = null;
  
  // Limpa campos
  $('#productForm')[0].reset();
  $('#productForm').removeClass('was-validated');
  
  // Reseta título do modal
  $('#modalTitle').text('Novo Produto');
}

function showSuccess(message) {
  alert('✅ ' + message);
}
 
function showError(message) {
  alert('❌ ' + message);
  console.error(message);
}
