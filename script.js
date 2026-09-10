const SUPABASE_URL = "https://dfummxrgparocndnsahh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdW1teHJncGFyb2NuZG5zYWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTk1NTAsImV4cCI6MjEwNDUzNTU1MH0.o0kqzSrnVRSzQCliBeHRClOd1rc27LD5KcFOpcWYiMA";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const carousel = document.getElementById('carousel');
const modal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const gallery = document.getElementById('modal-gallery');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

async function carregarCatalogo() {
  // Adicionamos .order('nome', { ascending: true }) para organizar por marca/nome A-Z
  const { data: produtosBanco, error: errBanco } = await supabaseClient
    .from('produtos')
    .select('*')
    .order('nome', { ascending: true });

  if (errBanco) return console.error('Erro no banco:', errBanco);

  const { data: arquivosStorage, error: errStorage } = await supabaseClient
    .storage
    .from('produtos')
    .list('', { limit: 100 });

  if (errStorage) return console.error('Erro no Storage:', errStorage);

const listaProdutos = produtosBanco.map(prod => {
    const fotos = arquivosStorage
      .filter(arq => {
        // Remove a extensão (.webp, .jpg) para analisar o nome
        const nomeSemExtensao = arq.name.replace(/\.[^/.]+$/, "");
        // Garante que o nome termine exatamente com '-1', '-2', etc. referente ao id_produto
        return nomeSemExtensao === prod.id_produto || nomeSemExtensao.startsWith(prod.id_produto + '-');
      })
      .map(arq => `${SUPABASE_URL}/storage/v1/object/public/produtos/${encodeURIComponent(arq.name)}`)
      .sort();

    return {
      id: prod.id_produto,
      nome: prod.nome,
      preco: prod.preco ? parseFloat(prod.preco).toFixed(2).replace('.', ',') : '0,00',
      tamanho: prod.tamanho || 'Consultar',
      imagens: fotos
    };
  });
  
  renderCarousel(listaProdutos);
}

function renderCarousel(produtos) {
  carousel.innerHTML = '';

  produtos.forEach(produto => {
    if (produto.imagens.length === 0) return;

    const card = document.createElement('div');
    card.classList.add('card');

    const primeiraFoto = produto.imagens[0];
    const segundaFoto = produto.imagens[1] || primeiraFoto; // Usa a 2ª foto se existir, senão mantém a 1ª

    card.innerHTML = `
      <img src="${primeiraFoto}" alt="${produto.nome}" class="card-img">
      <div class="card-info">
        <h3>${produto.nome}</h3>
        <p>R$ ${produto.preco}</p>
      </div>
    `;

    const imgElement = card.querySelector('.card-img');

    // Troca a imagem ao passar o mouse
    card.addEventListener('mouseenter', () => {
      imgElement.src = segundaFoto;
    });

    // Volta para a primeira foto ao tirar o mouse
    card.addEventListener('mouseleave', () => {
      imgElement.src = primeiraFoto;
    });

    card.addEventListener('click', () => openModal(produto));
    carousel.appendChild(card);
  });
}


function openModal(produto) {
  document.getElementById('modal-title').innerText = produto.nome;
  document.getElementById('modal-price').innerText = `R$ ${produto.preco}`;
  document.getElementById('modal-size').innerText = produto.tamanho;

  gallery.innerHTML = '';

  produto.imagens.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    gallery.appendChild(img);
  });

  // Oculta as setas se houver apenas 1 imagem
  if (produto.imagens.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  } else {
    if (prevBtn) prevBtn.style.display = 'block';
    if (nextBtn) nextBtn.style.display = 'block';
  }

  modal.classList.remove('hidden');
  gallery.scrollLeft = 0; // Reseta a posição da rolagem
}

// Eventos de clique nas setas
if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    gallery.scrollBy({ left: -gallery.clientWidth, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    gallery.scrollBy({ left: gallery.clientWidth, behavior: 'smooth' });
  });
}

closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});

carregarCatalogo();

// Navegação do catálogo principal via setas
const catalogCarousel = document.getElementById('carousel');
const catalogPrevBtn = document.getElementById('catalog-prev');
const catalogNextBtn = document.getElementById('catalog-next');

if (catalogPrevBtn && catalogNextBtn && catalogCarousel) {
  catalogPrevBtn.addEventListener('click', () => {
    catalogCarousel.scrollBy({ left: -catalogCarousel.clientWidth, behavior: 'smooth' });
  });

  catalogNextBtn.addEventListener('click', () => {
    catalogCarousel.scrollBy({ left: catalogCarousel.clientWidth, behavior: 'smooth' });
  });
}