import { initHeader } from './header.js';
import { initReveal, initCounters, initVideos } from './reveal.js';
import { initHeroChat } from './hero-chat.js';
import { initCarousel } from './carousel.js';
import { initModal } from './modal.js';
import { initForm } from './form.js';
import { initAssistant } from './assistant.js';

initHeader();
initReveal();
initCounters();
initVideos();
initHeroChat();
initCarousel(document.getElementById('services-carousel'));
initModal();
initForm();
initAssistant();
