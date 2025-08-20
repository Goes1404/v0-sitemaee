document.addEventListener('DOMContentLoaded', function () {
    const collapseMenu = document.querySelector('#navbarNavAltMarkup');
    const brand = document.querySelector('.navbar-brand');
    const navLinks = document.querySelectorAll('#navbarNavAltMarkup .m-item');

    if (collapseMenu && brand) {
        // Quando o menu COMEÇA A ABRIR no celular...
        collapseMenu.addEventListener('show.bs.collapse', () => {
            // ...adiciona a classe que move o título para a direita.
            brand.classList.add('brand-aligned-right');
        });

        // Quando o menu COMEÇA A FECHAR no celular...
        collapseMenu.addEventListener('hide.bs.collapse', () => {
            // ...remove a classe, fazendo o título voltar ao centro.
            brand.classList.remove('brand-aligned-right');
        });
    }

    // Esta parte continua igual: fecha o menu ao clicar em um link.
    if (collapseMenu) {
        const menuInstance = new bootstrap.Collapse(collapseMenu, { toggle: false });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (collapseMenu.classList.contains('show')) {
                    menuInstance.hide();
                }
            });
        });
    }
})


// Adicione este código dentro do seu principal ouvinte 'DOMContentLoaded'
document.addEventListener('DOMContentLoaded', function () {

    // --- (Mantenha os outros códigos que você já tem aqui) ---


    // --- CÓDIGO NOVO PARA ATUALIZAR O LINK DO WHATSAPP ---

    const myCarousel = document.getElementById('carouselExampleInterval');
    const whatsappLink = document.getElementById('whatsapp-link');
    const phoneNumber = '5511996188216'; // Coloque seu número aqui para facilitar

    // Função que atualiza o link do WhatsApp
    function updateWhatsappLink() {
        // Encontra o item do carrossel que está ativo (visível) no momento
        const activeItem = myCarousel.querySelector('.carousel-item.active');
        
        // Se não encontrar um item ativo, não faz nada
        if (!activeItem) {
            return;
        }

        // Pega a mensagem personalizada do atributo "data-whatsapp-message"
        const message = activeItem.getAttribute('data-whatsapp-message');
        
        // Se não houver mensagem definida, usa uma mensagem padrão
        const defaultMessage = "Olá! Gostaria de mais informações.";
        const textToSend = message || defaultMessage;
        
        // Codifica a mensagem para ser usada em uma URL (troca espaços por %20, etc.)
        const encodedText = encodeURIComponent(textToSend);
        
        // Cria o novo link do WhatsApp e atualiza o botão
        whatsappLink.href = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;
    }

    // Adiciona um "ouvinte" ao carrossel. Ele dispara a função toda vez que um slide TERMINA de mudar.
    myCarousel.addEventListener('slid.bs.carousel', updateWhatsappLink);

    // Chama a função uma vez no início para definir a mensagem do primeiro slide
    updateWhatsappLink();

});
