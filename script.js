import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA0Mrnk2Lz-qYbjkKuzl2qR3OR_tfEGVpY",
  authDomain: "catalogo-dlirio.firebaseapp.com",
  projectId: "catalogo-dlirio",
  storageBucket: "catalogo-dlirio.firebasestorage.app",
  messagingSenderId: "914598403289",
  appId: "1:914598403289:web:3ad35c5af87f8616e3f2c8",
  measurementId: "G-RNYQNZBBZV"
};

// Inicialização do Firebase, Firestore e Storage
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Seleção de elementos do DOM
const carousel = document.getElementById("carousel");
const modal = document.getElementById("product-modal");
const closeModalBtn = document.getElementById("close-modal");
const gallery = document.getElementById("modal-gallery");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

/* =========================================================
   CARREGAR PRODUTOS (FIREBASE)
   ========================================================= */

async function carregarCatalogo() {
  try {
    const q = query(collection(db, "produtos"), orderBy("nome", "asc"));
    const querySnapshot = await getDocs(q);

    const listaProdutos = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      listaProdutos.push({
        id: doc.id,
        nome: data.nome,
        preco: data.preco
          ? parseFloat(data.preco).toFixed(2).replace(".", ",")
          : "0,00",
        tamanho: data.tamanho || "Consultar",
        // Pega o array de URLs guardado diretamente no banco
        imagens: data.imagens || [] 
      });
    });

    renderCarousel(listaProdutos);
  } catch (error) {
    console.error("Erro ao carregar catálogo:", error);
  }
}

    // 3. Junta as fotos com cada produto (mesma lógica do seu código anterior)
    const listaProdutos = produtosBanco.map((prod) => {
      const fotos = arquivosStorage
        .filter((arq) => {
          const nomeSemExtensao = arq.name.replace(/\.[^/.]+$/, "");
          return (
            nomeSemExtensao === prod.id_produto ||
            nomeSemExtensao.startsWith(prod.id_produto + "-")
          );
        })
        .map((arq) => arq.url)
        .sort();

      return {
        id: prod.id_produto,
        nome: prod.nome,
        preco: prod.preco
          ? parseFloat(prod.preco)
              .toFixed(2)
              .replace(".", ",")
          : "0,00",
        tamanho: prod.tamanho || "Consultar",
        imagens: fotos
      };
    });

    renderCarousel(listaProdutos);
  } catch (error) {
    console.error("Erro ao carregar catálogo:", error);
  }
}

/* =========================================================
   RENDERIZAR CARROSSEL
   ========================================================= */

function renderCarousel(produtos) {
  carousel.innerHTML = "";

  produtos.forEach((produto) => {
    if (!produto.imagens.length) {
      return;
    }

    const card = document.createElement("div");
    card.classList.add("card");

    const primeiraFoto = produto.imagens[0];
    const segundaFoto = produto.imagens[1] || primeiraFoto;

    card.innerHTML = `
      <img
        src="${primeiraFoto}"
        alt="${produto.nome}"
        class="card-img"
      >
      <div class="card-info">
        <h3>${produto.nome}</h3>
        <p>R$ ${produto.preco}</p>
      </div>
    `;

    const imgElement = card.querySelector(".card-img");

    /* DESKTOP - TROCAR FOTO COM MOUSE */
    card.addEventListener("mouseenter", () => {
      if (segundaFoto !== primeiraFoto) {
        imgElement.src = segundaFoto;
      }
    });

    card.addEventListener("mouseleave", () => {
      imgElement.src = primeiraFoto;
    });

    /* ABRIR MODAL */
    card.addEventListener("click", () => {
      openModal(produto);
    });

    carousel.appendChild(card);
  });
}

/* =========================================================
   MODAL DO PRODUTO
   ========================================================= */

function openModal(produto) {
  document.getElementById("modal-title").innerText = produto.nome;
  document.getElementById("modal-price").innerText = `R$ ${produto.preco}`;
  document.getElementById("modal-size").innerText = produto.tamanho;

  gallery.innerHTML = "";

  produto.imagens.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.alt = produto.nome;
    gallery.appendChild(img);
  });

  /* SETAS DO MODAL */
  if (produto.imagens.length <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
  } else {
    if (prevBtn) prevBtn.style.display = "flex";
    if (nextBtn) nextBtn.style.display = "flex";
  }

  modal.classList.remove("hidden");

  /* Volta a galeria para primeira imagem */
  gallery.scrollTo({
    left: 0,
    behavior: "auto"
  });
}

/* =========================================================
   SETAS DO MODAL
   ========================================================= */

if (prevBtn && nextBtn) {
  prevBtn.addEventListener("click", () => {
    const distancia = gallery.clientWidth;
    gallery.scrollBy({
      left: -distancia,
      behavior: "smooth"
    });
  });

  nextBtn.addEventListener("click", () => {
    const distancia = gallery.clientWidth;
    gallery.scrollBy({
      left: distancia,
      behavior: "smooth"
    });
  });
}

/* =========================================================
   FECHAR MODAL
   ========================================================= */

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

/* =========================================================
   CARREGAR CATÁLOGO
   ========================================================= */

carregarCatalogo();

/* =========================================================
   NAVEGAÇÃO DO CARROSSEL PRINCIPAL
   ========================================================= */

const catalogPrevBtn = document.getElementById("catalog-prev");
const catalogNextBtn = document.getElementById("catalog-next");

/* PEGAR O TAMANHO REAL DE UM CARD */
function obterLarguraDoCard() {
  const primeiroCard = carousel.querySelector(".card");

  if (!primeiroCard) {
    return carousel.clientWidth;
  }

  const estilo = window.getComputedStyle(carousel);
  const gap = parseFloat(estilo.gap) || 0;

  return primeiroCard.offsetWidth + gap;
}

/* BOTÃO ANTERIOR E PRÓXIMO */
if (catalogPrevBtn && catalogNextBtn && carousel) {
  catalogPrevBtn.addEventListener("click", () => {
    const distancia = obterLarguraDoCard();
    carousel.scrollBy({
      left: -distancia,
      behavior: "smooth"
    });
  });

  catalogNextBtn.addEventListener("click", () => {
    const distancia = obterLarguraDoCard();
    carousel.scrollBy({
      left: distancia,
      behavior: "smooth"
    });
  });
}