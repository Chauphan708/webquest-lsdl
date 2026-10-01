/**
 * HỆ THỐNG WEBQUEST LỊCH SỬ VÀ ĐỊA LÍ 5 - TRƯỜNG TIỂU HỌC TRUNG NHỨT
 * QUẢN TRỊ TOÀN DIỆN: ĐẦU TRANG, CHÂN TRANG, CHỦ ĐỀ, NHÓM HỌC SINH & BẢO MẬT
 */

// Trạng thái ứng dụng
const AppState = {
  siteConfig: null,
  topics: [],
  submissions: [],
  currentTopicId: null,
  currentStep: 'introduction',
  activeView: 'portal', // 'portal' | 'topic' | 'submission' | 'showcase'
  activeAdminTab: 'general', // 'general' | 'topics' | 'groups' | 'security'
  isAdminAuthenticated: false,
  
  // Media streams
  cameraStream: null,
  capturedPhotoData: null,
  mediaRecorder: null,
  audioChunks: [],
  recordedAudioUrl: null,
  recordTimerInterval: null,
  recordSeconds: 0
};

// Khởi chạy khi tài liệu tải xong
document.addEventListener('DOMContentLoaded', async () => {
  await loadInitialData();
  applySiteConfigToUI();
  setupEventListeners();
  renderApp();
  initConfettiCanvas();
});

// Tải dữ liệu ban đầu
async function loadInitialData() {
  try {
    // 1. Tải cấu hình trang web (Site Config)
    const savedConfig = localStorage.getItem('webquest_site_config_v1');
    if (savedConfig) {
      AppState.siteConfig = JSON.parse(savedConfig);
    } else {
      const resConfig = await fetch('data/site_config.json');
      AppState.siteConfig = await resConfig.json();
      localStorage.setItem('webquest_site_config_v1', JSON.stringify(AppState.siteConfig));
    }

    // 2. Tải danh mục chủ đề (Topics)
    const savedTopics = localStorage.getItem('webquest_topics_v1');
    if (savedTopics) {
      AppState.topics = JSON.parse(savedTopics);
    } else {
      const resTopics = await fetch('data/topics.json');
      AppState.topics = await resTopics.json();
      localStorage.setItem('webquest_topics_v1', JSON.stringify(AppState.topics));
    }

    // 3. Tải bài nộp của học sinh (Submissions)
    const savedSubs = localStorage.getItem('webquest_submissions_v1');
    if (savedSubs) {
      AppState.submissions = JSON.parse(savedSubs);
    } else {
      const resSubs = await fetch('data/submissions.json');
      AppState.submissions = await resSubs.json();
      localStorage.setItem('webquest_submissions_v1', JSON.stringify(AppState.submissions));
    }
  } catch (err) {
    console.error('Lỗi khi nạp dữ liệu:', err);
  }
}

// Áp dụng dữ liệu cấu hình lên toàn bộ giao diện (Đầu trang, Hero, Thống kê, Chân trang)
function applySiteConfigToUI() {
  if (!AppState.siteConfig) return;
  const cfg = AppState.siteConfig;

  // Header & Title
  const pageTitle = document.getElementById('ui-page-title');
  if (pageTitle) pageTitle.innerText = `${cfg.header.siteTitle} - ${cfg.header.schoolName}`;
  const headerClass = document.getElementById('ui-header-class');
  if (headerClass) headerClass.innerText = cfg.header.classBadge;
  const headerSchool = document.getElementById('ui-header-school');
  if (headerSchool) headerSchool.innerText = cfg.header.schoolName;
  const headerTitle = document.getElementById('ui-header-title');
  if (headerTitle) headerTitle.innerText = cfg.header.siteTitle;

  // Hero Banner
  const heroTagline = document.getElementById('ui-hero-tagline');
  if (heroTagline) heroTagline.innerText = cfg.hero.tagline;
  const heroHeading = document.getElementById('ui-hero-heading');
  if (heroHeading) heroHeading.innerText = cfg.hero.mainHeading;
  const heroDesc = document.getElementById('ui-hero-desc');
  if (heroDesc) heroDesc.innerText = cfg.hero.description;
  const heroBtnPrimary = document.getElementById('ui-hero-btn-primary');
  if (heroBtnPrimary) heroBtnPrimary.innerText = cfg.hero.primaryBtnText;
  const heroBtnSecondary = document.getElementById('ui-hero-btn-secondary');
  if (heroBtnSecondary) heroBtnSecondary.innerText = cfg.hero.secondaryBtnText;

  // Stats Grid
  const statsGrid = document.getElementById('ui-stats-grid');
  if (statsGrid && cfg.stats) {
    statsGrid.innerHTML = cfg.stats.map(s => `
      <div class="card p-4 text-center">
        <div class="text-3xl font-extrabold ${s.color || 'text-slate-800'} mb-1">${s.value}</div>
        <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">${s.label}</div>
      </div>
    `).join('');
  }

  // Guide
  if (cfg.guide) {
    const guideHeading = document.getElementById('ui-guide-heading');
    if (guideHeading) guideHeading.innerText = cfg.guide.heading;
    const g1Title = document.getElementById('ui-guide-step1-title');
    if (g1Title) g1Title.innerText = cfg.guide.step1Title;
    const g1Desc = document.getElementById('ui-guide-step1-desc');
    if (g1Desc) g1Desc.innerText = cfg.guide.step1Desc;
    const g2Title = document.getElementById('ui-guide-step2-title');
    if (g2Title) g2Title.innerText = cfg.guide.step2Title;
    const g2Desc = document.getElementById('ui-guide-step2-desc');
    if (g2Desc) g2Desc.innerText = cfg.guide.step2Desc;
    const g3Title = document.getElementById('ui-guide-step3-title');
    if (g3Title) g3Title.innerText = cfg.guide.step3Title;
    const g3Desc = document.getElementById('ui-guide-step3-desc');
    if (g3Desc) g3Desc.innerText = cfg.guide.step3Desc;
  }

  // Footer
  const footerOrg = document.getElementById('ui-footer-org');
  if (footerOrg) footerOrg.innerText = cfg.footer.orgName;
  const footerInfo = document.getElementById('ui-footer-info');
  if (footerInfo) footerInfo.innerText = cfg.footer.initiativeInfo;
  const footerCopyright = document.getElementById('ui-footer-copyright');
  if (footerCopyright) footerCopyright.innerText = cfg.footer.copyright;
}

// Thiết lập các sự kiện điều hướng chung
function setupEventListeners() {
  // Điều hướng thanh Header
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = el.getAttribute('data-nav');
      navigateTo(targetView);
    });
  });

  // Nút mở Bảng Cài đặt Giáo viên
  const btnOpenAdmin = document.getElementById('btn-open-admin');
  if (btnOpenAdmin) {
    btnOpenAdmin.addEventListener('click', handleOpenAdminModal);
  }

  // Nút đóng Modal Cài đặt
  const btnCloseAdmin = document.getElementById('btn-close-admin');
  if (btnCloseAdmin) {
    btnCloseAdmin.addEventListener('click', () => {
      document.getElementById('admin-modal').classList.add('hidden');
    });
  }

  // Toggle cửa sổ Chat Trợ lý AI
  const btnToggleAi = document.getElementById('btn-toggle-ai-chat');
  const aiChatWindow = document.getElementById('ai-chat-window');
  if (btnToggleAi && aiChatWindow) {
    btnToggleAi.addEventListener('click', () => {
      aiChatWindow.classList.toggle('hidden');
      if (!aiChatWindow.classList.contains('hidden')) {
        renderAiChatWelcome();
      }
    });
  }

  const btnCloseAi = document.getElementById('btn-close-ai-chat');
  if (btnCloseAi && aiChatWindow) {
    btnCloseAi.addEventListener('click', () => {
      aiChatWindow.classList.add('hidden');
    });
  }

  // Gửi tin nhắn tới Trợ lý AI
  const btnSendAi = document.getElementById('btn-send-ai-msg');
  const inputAi = document.getElementById('input-ai-msg');
  if (btnSendAi && inputAi) {
    btnSendAi.addEventListener('click', () => handleSendAiMessage(inputAi.value));
    inputAi.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSendAiMessage(inputAi.value);
    });
  }
}

// Điều hướng chế độ xem chính
function navigateTo(view, topicId = null) {
  AppState.activeView = view;
  if (topicId) {
    AppState.currentTopicId = topicId;
    AppState.currentStep = 'introduction';
  }

  // Tắt camera/micro nếu đang chạy
  stopCamera();
  stopAudioRecording();

  // Đổi trạng thái active trên menu
  document.querySelectorAll('[data-nav]').forEach(el => {
    if (el.getAttribute('data-nav') === view) {
      el.classList.add('font-bold', 'text-slate-900', 'border-b-2', 'border-slate-800');
    } else {
      el.classList.remove('font-bold', 'text-slate-900', 'border-b-2', 'border-slate-800');
    }
  });

  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hàm render trung tâm
function renderApp() {
  const portalView = document.getElementById('view-portal');
  const topicView = document.getElementById('view-topic');
  const submissionView = document.getElementById('view-submission');
  const showcaseView = document.getElementById('view-showcase');

  [portalView, topicView, submissionView, showcaseView].forEach(v => {
    if (v) v.classList.add('hidden');
  });

  if (AppState.activeView === 'portal') {
    portalView.classList.remove('hidden');
    renderPortal();
  } else if (AppState.activeView === 'topic') {
    topicView.classList.remove('hidden');
    renderTopicDetail();
  } else if (AppState.activeView === 'submission') {
    submissionView.classList.remove('hidden');
    renderSubmissionForm();
  } else if (AppState.activeView === 'showcase') {
    showcaseView.classList.remove('hidden');
    renderShowcaseGallery();
  }

  updateAiFloatingButton();
}

// -------------------------------------------------------------
// 1. RENDER TRANG CHỦ (PORTAL)
// -------------------------------------------------------------
function renderPortal() {
  const container = document.getElementById('portal-topics-grid');
  if (!container) return;

  container.innerHTML = AppState.topics.map(topic => `
    <div class="card flex flex-col justify-between" style="border-top: 4px solid ${topic.themeColor};">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="badge" style="background-color: ${topic.bgColor}; color: ${topic.themeColor}; border-color: ${topic.themeColor}30;">
            ${topic.number}
          </span>
          <span class="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
            ${topic.badge}
          </span>
        </div>
        <h3 class="text-xl font-bold mb-2 text-slate-900">${topic.title}</h3>
        <p class="text-sm text-slate-600 mb-4 line-clamp-2">${topic.subtitle}</p>
        
        <div class="p-3 rounded-lg mb-4 flex items-center gap-3" style="background-color: ${topic.bgColor};">
          <span class="text-2xl">${topic.aiPersona.avatar}</span>
          <div class="text-xs">
            <span class="font-bold text-slate-800 block">${topic.aiPersona.name}</span>
            <span class="text-slate-600">${topic.aiPersona.role}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-slate-100">
        <button onclick="navigateTo('topic', '${topic.id}')" class="btn btn-primary w-full" style="background-color: ${topic.themeColor};">
          Khám phá WebQuest
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// 2. RENDER CHI TIẾT 1 CHỦ ĐỀ WEBQUEST (6 BƯỚC CHUẨN MỰC)
// -------------------------------------------------------------
function renderTopicDetail() {
  const topic = AppState.topics.find(t => t.id === AppState.currentTopicId) || AppState.topics[0];
  if (!topic) return;

  const header = document.getElementById('topic-header');
  const tabsContainer = document.getElementById('topic-tabs-nav');
  const stepContentContainer = document.getElementById('topic-step-content');

  document.documentElement.style.setProperty('--active-theme-color', topic.themeColor);

  header.innerHTML = `
    <div class="p-6 md:p-8 rounded-2xl mb-8" style="background-color: ${topic.bgColor}; border: 1px solid ${topic.themeColor}30;">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div class="flex items-center gap-2">
          <span class="badge" style="background-color: ${topic.themeColor}; color: #ffffff;">
            ${topic.number}
          </span>
          <span class="badge bg-white text-slate-700 border border-slate-200">
            ${topic.badge}
          </span>
        </div>
        <button onclick="navigateTo('submission', '${topic.id}')" class="btn btn-primary" style="background-color: ${topic.themeColor};">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Nộp bài chủ đề này
        </button>
      </div>
      <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">${topic.title}</h1>
      <p class="text-base text-slate-700 max-w-3xl">${topic.subtitle}</p>
    </div>
  `;

  const stepsConfig = [
    { key: 'introduction', label: '1. Mở đầu', icon: '📖' },
    { key: 'task', label: '2. Nhiệm vụ', icon: '🎯' },
    { key: 'process', label: '3. Tiến trình', icon: '🧭' },
    { key: 'resources', label: '4. Tài nguyên', icon: '📚' },
    { key: 'evaluation', label: '5. Đánh giá', icon: '⭐' },
    { key: 'conclusion', label: '6. Kết luận', icon: '🏆' }
  ];

  tabsContainer.innerHTML = stepsConfig.map(s => `
    <button class="webquest-nav-tab ${AppState.currentStep === s.key ? 'active' : ''}" onclick="switchWebQuestStep('${s.key}')">
      <span>${s.icon}</span>
      <span>${s.label}</span>
    </button>
  `).join('');

  renderCurrentStepContent(topic, stepContentContainer);
}

function switchWebQuestStep(stepKey) {
  AppState.currentStep = stepKey;
  renderTopicDetail();
}

function renderCurrentStepContent(topic, container) {
  const step = topic.steps[AppState.currentStep];
  if (!step) return;

  let html = `<div class="card p-6 md:p-8">`;

  switch (AppState.currentStep) {
    case 'introduction':
      html += `
        <h2 class="text-2xl font-bold mb-4 text-slate-900">${step.heading}</h2>
        <div class="prose max-w-none text-slate-700 leading-relaxed text-base space-y-4 mb-6">
          <p>${step.content}</p>
        </div>
        ${step.quote ? `
          <div class="p-4 rounded-xl italic text-slate-700 bg-slate-50 border-l-4" style="border-color: ${topic.themeColor};">
            "${step.quote}"
          </div>
        ` : ''}
        <div class="mt-8 flex justify-end">
          <button onclick="switchWebQuestStep('task')" class="btn btn-primary" style="background-color: ${topic.themeColor};">
            Bước tiếp theo: Xem Nhiệm vụ ➔
          </button>
        </div>
      `;
      break;

    case 'task':
      html += `
        <h2 class="text-2xl font-bold mb-2 text-slate-900">${step.heading}</h2>
        <p class="text-slate-600 mb-6">${step.content}</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          ${step.groups ? step.groups.map((grp, idx) => `
            <div class="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Nhiệm vụ ${idx+1}</span>
                <h4 class="font-bold text-slate-900 text-lg mb-2">${grp.name}</h4>
                <p class="text-sm text-slate-700 mb-4 leading-relaxed">${grp.mission}</p>
              </div>
              <div class="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                <strong class="text-slate-800 block mb-1">📦 Sản phẩm cần nộp:</strong>
                ${grp.deliverable}
              </div>
            </div>
          `).join('') : ''}
        </div>
        <div class="flex justify-between items-center">
          <button onclick="switchWebQuestStep('introduction')" class="btn btn-secondary">⬅ Quay lại</button>
          <button onclick="switchWebQuestStep('process')" class="btn btn-primary" style="background-color: ${topic.themeColor};">
            Tiếp theo: Xem Tiến trình ➔
          </button>
        </div>
      `;
      break;

    case 'process':
      html += `
        <h2 class="text-2xl font-bold mb-6 text-slate-900">${step.heading}</h2>
        <div class="space-y-4 mb-8">
          ${step.stages ? step.stages.map((stg, i) => `
            <div class="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0" style="background-color: ${topic.themeColor};">
                ${i+1}
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-base mb-1">${stg.step}</h4>
                <p class="text-sm text-slate-600">${stg.desc}</p>
              </div>
            </div>
          `).join('') : ''}
        </div>
        <div class="flex justify-between items-center">
          <button onclick="switchWebQuestStep('task')" class="btn btn-secondary">⬅ Quay lại</button>
          <button onclick="switchWebQuestStep('resources')" class="btn btn-primary" style="background-color: ${topic.themeColor};">
            Tiếp theo: Mở Tài nguyên số ➔
          </button>
        </div>
      `;
      break;

    case 'resources':
      html += `
        <h2 class="text-2xl font-bold mb-6 text-slate-900">${step.heading}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          ${step.items ? step.items.map(res => `
            <div class="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white">
              <span class="badge text-xs mb-2" style="background-color: ${topic.bgColor}; color: ${topic.themeColor};">
                ${res.tag}
              </span>
              <h4 class="font-bold text-slate-900 mb-1 text-base">${res.title}</h4>
              <p class="text-sm text-slate-600 mb-3">${res.desc}</p>
              <div class="text-xs font-semibold text-blue-600 flex items-center gap-1">
                Tài liệu đã xác thực an toàn ✓
              </div>
            </div>
          `).join('') : ''}
        </div>
        <div class="flex justify-between items-center">
          <button onclick="switchWebQuestStep('process')" class="btn btn-secondary">⬅ Quay lại</button>
          <button onclick="switchWebQuestStep('evaluation')" class="btn btn-primary" style="background-color: ${topic.themeColor};">
            Tiếp theo: Tiêu chí Đánh giá ➔
          </button>
        </div>
      `;
      break;

    case 'evaluation':
      html += `
        <h2 class="text-2xl font-bold mb-2 text-slate-900">${step.heading}</h2>
        <p class="text-sm text-slate-600 mb-6">Học sinh tự đối chiếu để hoàn thiện sản phẩm đạt mức Tốt nhất trước khi nộp:</p>
        <div class="overflow-x-auto mb-8">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-100 text-slate-800">
                <th class="p-3 border border-slate-200">Tiêu chí năng lực</th>
                <th class="p-3 border border-slate-200 text-emerald-800 bg-emerald-50">Mức Tốt</th>
                <th class="p-3 border border-slate-200 text-amber-800 bg-amber-50">Mức Đạt</th>
                <th class="p-3 border border-slate-200 text-rose-800 bg-rose-50">Cần cố gắng</th>
              </tr>
            </thead>
            <tbody>
              ${step.criteria ? step.criteria.map(c => `
                <tr>
                  <td class="p-3 border border-slate-200 font-bold text-slate-800">${c.name}</td>
                  <td class="p-3 border border-slate-200 text-slate-700">${c.good}</td>
                  <td class="p-3 border border-slate-200 text-slate-700">${c.medium}</td>
                  <td class="p-3 border border-slate-200 text-slate-600">${c.poor}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>
        <div class="flex justify-between items-center">
          <button onclick="switchWebQuestStep('resources')" class="btn btn-secondary">⬅ Quay lại</button>
          <button onclick="switchWebQuestStep('conclusion')" class="btn btn-primary" style="background-color: ${topic.themeColor};">
            Tiếp theo: Kết luận & Huy hiệu ➔
          </button>
        </div>
      `;
      break;

    case 'conclusion':
      html += `
        <h2 class="text-2xl font-bold mb-4 text-slate-900">${step.heading}</h2>
        <div class="p-6 rounded-2xl mb-6" style="background-color: ${topic.bgColor}; border: 1px solid ${topic.themeColor}30;">
          <p class="text-slate-800 text-base leading-relaxed mb-4">${step.content}</p>
          <div class="inline-flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-slate-200 font-bold text-slate-900">
            <span class="text-2xl">🎖️</span>
            <span>${step.badge}</span>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-slate-100">
          <button onclick="switchWebQuestStep('evaluation')" class="btn btn-secondary">⬅ Xem lại Đánh giá</button>
          <button onclick="navigateTo('submission', '${topic.id}')" class="btn btn-primary btn-large w-full sm:w-auto" style="background-color: ${topic.themeColor};">
            🚀 Nộp bài ngay để nhận Huy hiệu!
          </button>
        </div>
      `;
      break;
  }

  html += `</div>`;
  container.innerHTML = html;
}

// -------------------------------------------------------------
// 3. RENDER KHU VỰC NỘP BÀI SIÊU TỐI GIẢN (CAMERA & MICRO)
// -------------------------------------------------------------
function renderSubmissionForm() {
  const container = document.getElementById('submission-container');
  if (!container) return;

  const topicOptions = AppState.topics.map(t => `
    <option value="${t.id}" ${t.id === AppState.currentTopicId ? 'selected' : ''}>
      ${t.number}: ${t.title}
    </option>
  `).join('');

  container.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <div class="card p-6 md:p-8">
        <div class="text-center mb-6">
          <span class="badge bg-emerald-100 text-emerald-800 mb-2">Dành cho học sinh lớp 5A2</span>
          <h2 class="text-2xl font-extrabold text-slate-900">Nộp bài tập WebQuest 1 chạm</h2>
          <p class="text-sm text-slate-600 mt-1">Không cần tài khoản - Chọn nhóm và chụp ảnh hoặc ghi âm lời nói</p>
        </div>

        <form id="student-submission-form" onsubmit="handleStudentSubmit(event)" class="space-y-6">
          <!-- 1. Chọn Chủ đề -->
          <div>
            <label class="block text-sm font-bold text-slate-800 mb-2">1. Chọn bài học em đang nộp:</label>
            <select id="sub-topic-id" class="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800">
              ${topicOptions}
            </select>
          </div>

          <!-- 2. Chọn Tên nhóm (1 chạm) -->
          <div>
            <label class="block text-sm font-bold text-slate-800 mb-2">2. Chọn nhóm của em:</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="group-select-cards">
              ${renderGroupCards()}
            </div>
            <input type="hidden" id="sub-group-name" value="${AppState.siteConfig.groups[0]?.name || 'Nhóm 1'}">
          </div>

          <!-- 3. Tên thành viên (tuỳ chọn) -->
          <div>
            <label class="block text-sm font-bold text-slate-800 mb-1">Tên các bạn trong nhóm:</label>
            <input type="text" id="sub-students" placeholder="Ví dụ: Nam, Mai Anh, Bảo..." class="w-full p-3 rounded-xl border border-slate-300 font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm">
          </div>

          <!-- 4. Chọn phương thức nộp bài 1 chạm -->
          <div>
            <label class="block text-sm font-bold text-slate-800 mb-2">3. Chọn cách nộp sản phẩm:</label>
            <div class="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
              <button type="button" class="btn flex-1 sub-tab-btn active bg-white shadow-sm" onclick="switchSubMode('camera')">
                📸 Chụp ảnh vở
              </button>
              <button type="button" class="btn flex-1 sub-tab-btn text-slate-600" onclick="switchSubMode('voice')">
                🎙️ Ghi âm giọng nói
              </button>
              <button type="button" class="btn flex-1 sub-tab-btn text-slate-600" onclick="switchSubMode('text')">
                ✍️ Viết chữ / Link
              </button>
            </div>

            <!-- Khung Mode 1: Camera -->
            <div id="sub-mode-camera" class="space-y-4">
              <div class="camera-container flex items-center justify-center text-slate-400">
                <video id="camera-video" autoplay playsinline class="hidden"></video>
                <canvas id="camera-canvas" class="hidden"></canvas>
                <img id="camera-preview" class="hidden" alt="Ảnh bài làm">
                <div id="camera-placeholder" class="text-center p-4">
                  <span class="text-4xl block mb-2">📷</span>
                  <p class="text-sm text-slate-300">Nhấn nút bên dưới để bật camera chụp ảnh bài làm trong vở hoặc tranh vẽ</p>
                </div>
              </div>
              <div class="flex justify-center gap-3">
                <button type="button" id="btn-start-camera" onclick="startCamera()" class="btn btn-secondary">
                  Bật Camera
                </button>
                <button type="button" id="btn-take-photo" onclick="capturePhoto()" class="btn btn-primary hidden">
                  📸 Chụp hình
                </button>
                <button type="button" id="btn-retake-photo" onclick="retakePhoto()" class="btn btn-secondary hidden">
                  Chụp lại
                </button>
              </div>
            </div>

            <!-- Khung Mode 2: Ghi âm Micro -->
            <div id="sub-mode-voice" class="hidden">
              <div class="voice-recorder-box">
                <div id="recorder-idle" class="space-y-3">
                  <span class="text-4xl block">🎙️</span>
                  <p class="text-sm text-slate-600">Nhấn nút đỏ để bắt đầu ghi âm lời nói của nhóm em</p>
                  <button type="button" onclick="startAudioRecording()" class="btn btn-primary" style="background-color: #DC2626;">
                    🔴 Bắt đầu ghi âm
                  </button>
                </div>
                <div id="recorder-active" class="hidden space-y-3">
                  <div class="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto text-2xl record-btn-pulse">
                    🎙️
                  </div>
                  <div class="text-2xl font-mono font-bold text-red-600" id="record-timer">00:00</div>
                  <p class="text-xs text-slate-500">Đang thu âm... Hãy nói rõ ràng vào micro máy tính</p>
                  <button type="button" onclick="stopAudioRecording()" class="btn btn-secondary">
                    ⏹ Dừng ghi âm & Nghe lại
                  </button>
                </div>
                <div id="recorder-done" class="hidden space-y-3">
                  <p class="text-sm font-bold text-emerald-700">✓ Đã thu âm xong bài nói!</p>
                  <audio id="audio-playback" controls class="mx-auto w-full max-w-sm"></audio>
                  <button type="button" onclick="resetAudioRecording()" class="text-xs text-slate-500 underline block mx-auto">
                    Thu âm lại từ đầu
                  </button>
                </div>
              </div>
            </div>

            <!-- Khung Mode 3: Nhập chữ / Link Canva -->
            <div id="sub-mode-text" class="hidden space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Tên bài nộp hoặc tiêu đề giải pháp:</label>
                <input type="text" id="sub-title" placeholder="Ví dụ: Sáng kiến tiết kiệm nước ngọt của Nhóm 2" class="w-full p-3 rounded-xl border border-slate-300 text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nội dung câu trả lời hoặc link bài làm:</label>
                <textarea id="sub-content" rows="4" placeholder="Nhập câu trả lời của nhóm hoặc dán đường link Canva/Youtube..." class="w-full p-3 rounded-xl border border-slate-300 text-sm"></textarea>
              </div>
            </div>
          </div>

          <!-- Nút Gửi bài chính thức -->
          <div class="pt-4 border-t border-slate-200 text-center">
            <button type="submit" id="btn-submit-work" class="btn btn-primary btn-large w-full" style="background-color: #1E293B;">
              🚀 GỬI BÀI NGAY & NHẬN HUY HIỆU
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderGroupCards() {
  const groups = AppState.siteConfig.groups || [
    { name: 'Nhóm 1: Rồng Vàng', icon: '🐉' },
    { name: 'Nhóm 2: Khảo Cổ Nhí', icon: '🏺' },
    { name: 'Nhóm 3: Sao Vuông', icon: '⭐' },
    { name: 'Nhóm 4: Trái Đất', icon: '🌱' }
  ];

  return groups.map((g, idx) => `
    <div onclick="selectGroup('${g.name}', this)" class="group-card cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${idx === 0 ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'}">
      <span class="text-2xl block mb-1">${g.icon}</span>
      <span class="text-xs font-bold block text-slate-800">${g.name}</span>
    </div>
  `).join('');
}

function selectGroup(groupName, element) {
  document.getElementById('sub-group-name').value = groupName;
  document.querySelectorAll('.group-card').forEach(el => {
    el.classList.remove('border-slate-800', 'bg-slate-50');
    el.classList.add('border-slate-200', 'bg-white');
  });
  element.classList.remove('border-slate-200', 'bg-white');
  element.classList.add('border-slate-800', 'bg-slate-50');
}

function switchSubMode(mode) {
  const modes = ['camera', 'voice', 'text'];
  modes.forEach(m => {
    document.getElementById(`sub-mode-${m}`).classList.add('hidden');
  });
  document.getElementById(`sub-mode-${mode}`).classList.remove('hidden');

  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.classList.remove('bg-white', 'shadow-sm', 'text-slate-900');
    btn.classList.add('text-slate-600');
  });
  event.currentTarget.classList.add('bg-white', 'shadow-sm', 'text-slate-900');
  event.currentTarget.classList.remove('text-slate-600');
}

// Thao tác Camera
async function startCamera() {
  try {
    AppState.cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    const video = document.getElementById('camera-video');
    video.srcObject = AppState.cameraStream;
    video.classList.remove('hidden');
    document.getElementById('camera-placeholder').classList.add('hidden');
    document.getElementById('btn-start-camera').classList.add('hidden');
    document.getElementById('btn-take-photo').classList.remove('hidden');
  } catch (err) {
    alert('Không thể mở camera. Vui lòng cấp quyền camera trên trình duyệt hoặc chuyển sang nộp bài bằng câu trả lời/link.');
  }
}

function capturePhoto() {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('camera-canvas');
  const preview = document.getElementById('camera-preview');

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  AppState.capturedPhotoData = canvas.toDataURL('image/jpeg', 0.85);
  preview.src = AppState.capturedPhotoData;
  preview.classList.remove('hidden');
  video.classList.add('hidden');

  document.getElementById('btn-take-photo').classList.add('hidden');
  document.getElementById('btn-retake-photo').classList.remove('hidden');

  stopCamera();
}

function retakePhoto() {
  document.getElementById('camera-preview').classList.add('hidden');
  document.getElementById('btn-retake-photo').classList.add('hidden');
  startCamera();
}

function stopCamera() {
  if (AppState.cameraStream) {
    AppState.cameraStream.getTracks().forEach(track => track.stop());
    AppState.cameraStream = null;
  }
}

// Thao tác Micro ghi âm
async function startAudioRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    AppState.mediaRecorder = new MediaRecorder(stream);
    AppState.audioChunks = [];

    AppState.mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) AppState.audioChunks.push(e.data);
    };

    AppState.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(AppState.audioChunks, { type: 'audio/webm' });
      AppState.recordedAudioUrl = URL.createObjectURL(audioBlob);
      const audioPlayback = document.getElementById('audio-playback');
      audioPlayback.src = AppState.recordedAudioUrl;

      document.getElementById('recorder-active').classList.add('hidden');
      document.getElementById('recorder-done').classList.remove('hidden');
    };

    AppState.mediaRecorder.start();
    document.getElementById('recorder-idle').classList.add('hidden');
    document.getElementById('recorder-active').classList.remove('hidden');

    AppState.recordSeconds = 0;
    AppState.recordTimerInterval = setInterval(() => {
      AppState.recordSeconds++;
      const mins = String(Math.floor(AppState.recordSeconds / 60)).padStart(2, '0');
      const secs = String(AppState.recordSeconds % 60).padStart(2, '0');
      document.getElementById('record-timer').innerText = `${mins}:${secs}`;
    }, 1000);
  } catch (err) {
    alert('Không thể kết nối Micro. Vui lòng cho phép quyền ghi âm trên trình duyệt.');
  }
}

function stopAudioRecording() {
  if (AppState.mediaRecorder && AppState.mediaRecorder.state !== 'inactive') {
    AppState.mediaRecorder.stop();
    clearInterval(AppState.recordTimerInterval);
  }
}

function resetAudioRecording() {
  document.getElementById('recorder-done').classList.add('hidden');
  document.getElementById('recorder-idle').classList.remove('hidden');
  AppState.recordedAudioUrl = null;
}

// Xử lý gửi bài nộp
function handleStudentSubmit(e) {
  e.preventDefault();
  const topicId = document.getElementById('sub-topic-id').value;
  const topic = AppState.topics.find(t => t.id === topicId) || AppState.topics[0];
  const groupName = document.getElementById('sub-group-name').value;
  const students = document.getElementById('sub-students').value || 'Các thành viên trong nhóm';
  
  let type = 'text';
  let mediaUrl = '';
  let content = document.getElementById('sub-content')?.value || 'Bài tập hoàn thành';
  let title = document.getElementById('sub-title')?.value || `Sản phẩm của ${groupName}`;

  if (AppState.capturedPhotoData) {
    type = 'image';
    mediaUrl = AppState.capturedPhotoData;
    title = `Ảnh bài làm của ${groupName}`;
  } else if (AppState.recordedAudioUrl) {
    type = 'audio';
    mediaUrl = AppState.recordedAudioUrl;
    title = `Bản ghi âm lời bình của ${groupName}`;
  }

  const newSubmission = {
    id: 'sub-' + Date.now(),
    topicId: topic.id,
    topicTitle: topic.title,
    groupName: groupName,
    studentNames: students,
    type: type,
    title: title,
    content: content,
    mediaUrl: mediaUrl,
    badge: 'Chiến Sĩ Số Tiên Phong',
    score: 'Đang chấm điểm',
    teacherFeedback: 'Thầy cô đã nhận được bài làm của nhóm em. Hãy tiếp tục phát huy nhé!',
    submittedAt: 'Vừa xong'
  };

  AppState.submissions.unshift(newSubmission);
  localStorage.setItem('webquest_submissions_v1', JSON.stringify(AppState.submissions));

  fireConfetti();
  alert(`🎉 CHÚC MỪNG ${groupName.toUpperCase()}!\nBài làm của các em đã được gửi thành công lên hệ thống WebQuest. Thầy cô sẽ xem và nhận xét ngay!`);
  navigateTo('showcase');
}

// -------------------------------------------------------------
// 4. RENDER BẢNG VINH DANH SẢN PHẨM (SHOWCASE GALLERY)
// -------------------------------------------------------------
function renderShowcaseGallery() {
  const container = document.getElementById('showcase-grid');
  if (!container) return;

  container.innerHTML = AppState.submissions.map(sub => `
    <div class="card flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-800 rounded-full">
            ${sub.groupName}
          </span>
          <span class="text-xs text-slate-400">${sub.submittedAt}</span>
        </div>

        <h4 class="font-bold text-slate-900 text-lg mb-1">${sub.title}</h4>
        <p class="text-xs font-semibold text-slate-500 mb-3">${sub.topicTitle}</p>

        ${sub.type === 'image' && sub.mediaUrl ? `
          <div class="rounded-xl overflow-hidden mb-3 max-h-48 border border-slate-200">
            <img src="${sub.mediaUrl}" alt="Bài nộp" class="w-full h-full object-cover">
          </div>
        ` : ''}

        ${sub.type === 'audio' && sub.mediaUrl ? `
          <div class="p-3 bg-slate-50 rounded-xl mb-3 border border-slate-200">
            <audio controls src="${sub.mediaUrl}" class="w-full"></audio>
          </div>
        ` : ''}

        <p class="text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          ${sub.content}
        </p>
      </div>

      <div class="pt-3 border-t border-slate-100">
        <div class="flex items-center justify-between mb-2">
          <span class="badge bg-amber-50 text-amber-800 border-amber-200 text-xs">
            🎖️ ${sub.badge}
          </span>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            ${sub.score}
          </span>
        </div>
        <p class="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
          <strong>Nhận xét của GV:</strong> ${sub.teacherFeedback}
        </p>
      </div>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// 5. TRỢ LÝ AI SƯ PHẠM (INTERACTIVE PERSONA CHATBOT)
// -------------------------------------------------------------
function updateAiFloatingButton() {
  const currentTopic = AppState.topics.find(t => t.id === AppState.currentTopicId) || AppState.topics[0];
  const avatarEl = document.getElementById('ai-floating-avatar');
  const nameEl = document.getElementById('ai-floating-name');
  if (avatarEl && currentTopic) avatarEl.innerText = currentTopic.aiPersona.avatar;
  if (nameEl && currentTopic) nameEl.innerText = currentTopic.aiPersona.name;
}

function renderAiChatWelcome() {
  const currentTopic = AppState.topics.find(t => t.id === AppState.currentTopicId) || AppState.topics[0];
  const messagesBox = document.getElementById('ai-messages-container');
  const quickPromptsBox = document.getElementById('ai-quick-prompts');
  const headerTitle = document.getElementById('ai-header-name');

  if (headerTitle) headerTitle.innerText = `${currentTopic.aiPersona.avatar} ${currentTopic.aiPersona.name}`;

  messagesBox.innerHTML = `
    <div class="flex items-start gap-2.5">
      <span class="text-2xl">${currentTopic.aiPersona.avatar}</span>
      <div class="p-3 bg-slate-100 text-slate-800 text-sm rounded-2xl rounded-tl-none leading-relaxed">
        ${currentTopic.aiPersona.welcomeMsg}
      </div>
    </div>
  `;

  quickPromptsBox.innerHTML = (currentTopic.aiPersona.quickPrompts || []).map(p => `
    <button type="button" onclick="handleSendAiMessage('${p}')" class="text-xs text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors w-full">
      💡 ${p}
    </button>
  `).join('');
}

function handleSendAiMessage(msgText) {
  if (!msgText || !msgText.trim()) return;
  const currentTopic = AppState.topics.find(t => t.id === AppState.currentTopicId) || AppState.topics[0];
  const messagesBox = document.getElementById('ai-messages-container');
  const inputAi = document.getElementById('input-ai-msg');

  messagesBox.innerHTML += `
    <div class="flex justify-end">
      <div class="p-3 bg-slate-800 text-white text-sm rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed">
        ${msgText}
      </div>
    </div>
  `;
  if (inputAi) inputAi.value = '';
  messagesBox.scrollTop = messagesBox.scrollHeight;

  setTimeout(() => {
    let aiReply = `Câu hỏi rất hay của nhà thám hiểm nhí! Để tìm câu trả lời chính xác nhất, em hãy mở mục "4. Tài nguyên" của ${currentTopic.number}, đọc kỹ phần tư liệu SGK và liên hệ với thực tế nhé!`;

    if (msgText.includes('Phù Nam') || msgText.includes('Óc Eo')) {
      aiReply = 'Cư dân Phù Nam xưa sống trên vùng đất sông nước Nam Bộ trù phú, gần biển lớn nên rất thuận lợi cho tàu buôn quốc tế ghé thăm. Em hãy quan sát các trang sức bằng vàng và bình gốm Óc Eo ở mục Tài nguyên để thấy sự khéo léo của tổ tiên mình nhé!';
    } else if (msgText.includes('Điện Biên Phủ') || msgText.includes('pháo')) {
      aiReply = 'Kéo pháo vào rồi kéo pháo ra là một quyết định lịch sử vô cùng khó khăn của Đại tướng Võ Nguyên Giáp. Chuyển sang "Đánh chắc tiến chắc" giúp bộ đội ta chuẩn bị công sự vững chắc hơn, bảo toàn lực lượng và chắc chắn giành thắng lợi!';
    } else if (msgText.includes('rác') || msgText.includes('kênh')) {
      aiReply = 'Hành động nhỏ của các em có ý nghĩa rất lớn! Hãy bắt đầu từ việc nhắc nhau bỏ rác đúng nơi quy định tại sân trường Trung Nhứt và cùng vẽ một bức tranh cổ động gửi lên triển lãm nhé!';
    }

    messagesBox.innerHTML += `
      <div class="flex items-start gap-2.5">
        <span class="text-2xl">${currentTopic.aiPersona.avatar}</span>
        <div class="p-3 bg-slate-100 text-slate-800 text-sm rounded-2xl rounded-tl-none leading-relaxed">
          ${aiReply}
        </div>
      </div>
    `;
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }, 600);
}

// -------------------------------------------------------------
// 6. PHÂN HỆ CÀI ĐẶT TOÀN DIỆN CHO GIÁO VIÊN (ADMIN STUDIO)
// -------------------------------------------------------------
function handleOpenAdminModal() {
  const modal = document.getElementById('admin-modal');
  modal.classList.remove('hidden');

  if (!AppState.isAdminAuthenticated) {
    document.getElementById('admin-auth-panel').classList.remove('hidden');
    document.getElementById('admin-studio-panel').classList.add('hidden');
  } else {
    document.getElementById('admin-auth-panel').classList.add('hidden');
    document.getElementById('admin-studio-panel').classList.remove('hidden');
    populateAdminFields();
  }
}

// Xác thực PIN - TUYỆT ĐỐI KHÔNG HIỂN THỊ MÃ PIN TRÊN GIAO DIỆN
function verifyAdminPin() {
  const pinInput = document.getElementById('admin-pin-input');
  const validPin = AppState.siteConfig?.adminPin || '5A2TN';

  if (pinInput.value === validPin) {
    AppState.isAdminAuthenticated = true;
    document.getElementById('admin-auth-panel').classList.add('hidden');
    document.getElementById('admin-studio-panel').classList.remove('hidden');
    populateAdminFields();
  } else {
    alert('Mã PIN không đúng! Vui lòng kiểm tra lại.');
  }
}

function switchAdminTab(tabKey) {
  AppState.activeAdminTab = tabKey;
  const tabs = ['general', 'topics', 'groups', 'security'];
  tabs.forEach(t => {
    document.getElementById(`admin-tab-${t}`).classList.add('hidden');
  });
  document.getElementById(`admin-tab-${tabKey}`).classList.remove('hidden');

  // Đổi trạng thái tab button
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.remove('active', 'font-bold', 'text-slate-900', 'border-b-2', 'border-slate-800');
    btn.classList.add('text-slate-500');
  });
  event.currentTarget.classList.add('active', 'font-bold', 'text-slate-900', 'border-b-2', 'border-slate-800');
  event.currentTarget.classList.remove('text-slate-500');
}

function populateAdminFields() {
  const cfg = AppState.siteConfig;
  if (!cfg) return;

  // Tab 1: General fields
  document.getElementById('cfg-class-badge').value = cfg.header.classBadge || '5A2';
  document.getElementById('cfg-school-name').value = cfg.header.schoolName || '';
  document.getElementById('cfg-site-title').value = cfg.header.siteTitle || '';
  document.getElementById('cfg-hero-tagline').value = cfg.hero.tagline || '';
  document.getElementById('cfg-hero-heading').value = cfg.hero.mainHeading || '';
  document.getElementById('cfg-hero-desc').value = cfg.hero.description || '';
  document.getElementById('cfg-footer-org').value = cfg.footer.orgName || '';
  document.getElementById('cfg-footer-info').value = cfg.footer.initiativeInfo || '';
  document.getElementById('cfg-footer-copyright').value = cfg.footer.copyright || '';

  // Tab 2: Topics list
  renderAdminTopicsList();

  // Tab 3: Groups fields
  renderAdminGroupsInputs();
}

// Lưu Tab 1: Cấu hình chung
function saveGeneralConfig(e) {
  e.preventDefault();
  AppState.siteConfig.header.classBadge = document.getElementById('cfg-class-badge').value;
  AppState.siteConfig.header.schoolName = document.getElementById('cfg-school-name').value;
  AppState.siteConfig.header.siteTitle = document.getElementById('cfg-site-title').value;
  AppState.siteConfig.hero.tagline = document.getElementById('cfg-hero-tagline').value;
  AppState.siteConfig.hero.mainHeading = document.getElementById('cfg-hero-heading').value;
  AppState.siteConfig.hero.description = document.getElementById('cfg-hero-desc').value;
  AppState.siteConfig.footer.orgName = document.getElementById('cfg-footer-org').value;
  AppState.siteConfig.footer.initiativeInfo = document.getElementById('cfg-footer-info').value;
  AppState.siteConfig.footer.copyright = document.getElementById('cfg-footer-copyright').value;

  localStorage.setItem('webquest_site_config_v1', JSON.stringify(AppState.siteConfig));
  applySiteConfigToUI();
  alert('✓ ĐÃ CẬP NHẬT ĐẦU TRANG & CHÂN TRANG THÀNH CÔNG!');
}

// Tab 2: Quản lý Topics
function renderAdminTopicsList() {
  const container = document.getElementById('admin-topics-list');
  if (!container) return;

  container.innerHTML = AppState.topics.map(t => `
    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
      <div>
        <span class="font-bold text-slate-800 block">${t.number}: ${t.title}</span>
        <span class="text-xs text-slate-500">${t.subtitle}</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="editTopicInAdmin('${t.id}')" class="btn btn-secondary text-xs py-1.5 px-3">
          ✏️ Sửa bài
        </button>
        <button onclick="deleteTopicInAdmin('${t.id}')" class="btn btn-secondary text-xs py-1.5 px-3 text-red-600 hover:bg-red-50">
          🗑️ Xóa
        </button>
      </div>
    </div>
  `).join('');
}

function openAddNewTopicForm() {
  const newId = 'topic-' + Date.now();
  document.getElementById('admin-edit-topic-id').value = newId;
  document.getElementById('admin-topic-form-title').innerText = 'Thêm chủ đề WebQuest mới:';
  document.getElementById('admin-edit-number').value = `Chủ đề ${AppState.topics.length + 1}`;
  document.getElementById('admin-edit-title').value = '';
  document.getElementById('admin-edit-color').value = '#2E4057';
  document.getElementById('admin-edit-subtitle').value = '';
  document.getElementById('admin-edit-intro').value = '';
  document.getElementById('admin-edit-quote').value = '';
  document.getElementById('admin-edit-task-desc').value = '';
  document.getElementById('admin-edit-conclusion').value = '';
  document.getElementById('admin-edit-badge').value = 'Huy hiệu: Nhà Khám Phá Mới';
  document.getElementById('admin-edit-botavatar').value = '🤖';
  document.getElementById('admin-edit-botname').value = 'Trợ lý AI';
  document.getElementById('admin-edit-botrole').value = 'Hướng dẫn viên học tập';
  document.getElementById('admin-edit-botwelcome').value = 'Chào các em, thầy cô đã sẵn sàng hỗ trợ các em!';
  document.getElementById('admin-edit-botprompt').value = 'Bạn là Trợ lý AI hỗ trợ học sinh tiểu học giải quyết vấn đề...';

  document.getElementById('admin-edit-form-box').classList.remove('hidden');
  document.getElementById('admin-edit-form-box').scrollIntoView({ behavior: 'smooth' });
}

function editTopicInAdmin(topicId) {
  const topic = AppState.topics.find(t => t.id === topicId);
  if (!topic) return;

  document.getElementById('admin-edit-topic-id').value = topic.id;
  document.getElementById('admin-topic-form-title').innerText = `Chỉnh sửa: ${topic.number}`;
  document.getElementById('admin-edit-number').value = topic.number || '';
  document.getElementById('admin-edit-title').value = topic.title || '';
  document.getElementById('admin-edit-color').value = topic.themeColor || '#2E4057';
  document.getElementById('admin-edit-subtitle').value = topic.subtitle || '';
  document.getElementById('admin-edit-intro').value = topic.steps?.introduction?.content || '';
  document.getElementById('admin-edit-quote').value = topic.steps?.introduction?.quote || '';
  document.getElementById('admin-edit-task-desc').value = topic.steps?.task?.content || '';
  document.getElementById('admin-edit-conclusion').value = topic.steps?.conclusion?.content || '';
  document.getElementById('admin-edit-badge').value = topic.steps?.conclusion?.badge || '';
  document.getElementById('admin-edit-botavatar').value = topic.aiPersona?.avatar || '🏺';
  document.getElementById('admin-edit-botname').value = topic.aiPersona?.name || '';
  document.getElementById('admin-edit-botrole').value = topic.aiPersona?.role || '';
  document.getElementById('admin-edit-botwelcome').value = topic.aiPersona?.welcomeMsg || '';
  document.getElementById('admin-edit-botprompt').value = topic.aiPersona?.systemPrompt || '';

  document.getElementById('admin-edit-form-box').classList.remove('hidden');
  document.getElementById('admin-edit-form-box').scrollIntoView({ behavior: 'smooth' });
}

function saveTopicFromAdmin(e) {
  e.preventDefault();
  const topicId = document.getElementById('admin-edit-topic-id').value;
  let topic = AppState.topics.find(t => t.id === topicId);

  const isNew = !topic;
  if (isNew) {
    topic = {
      id: topicId,
      badge: "Lịch sử & Địa lí 5",
      bgColor: "#FAF5F0",
      accentColor: "#9C7249",
      textColor: "#1E293B",
      steps: {
        introduction: {},
        task: { groups: [] },
        process: { stages: [] },
        resources: { items: [] },
        evaluation: { criteria: [] },
        conclusion: {}
      },
      aiPersona: {}
    };
    AppState.topics.push(topic);
  }

  topic.number = document.getElementById('admin-edit-number').value;
  topic.title = document.getElementById('admin-edit-title').value;
  topic.themeColor = document.getElementById('admin-edit-color').value;
  topic.subtitle = document.getElementById('admin-edit-subtitle').value;

  topic.steps.introduction.heading = "Lời mở đầu";
  topic.steps.introduction.content = document.getElementById('admin-edit-intro').value;
  topic.steps.introduction.quote = document.getElementById('admin-edit-quote').value;

  topic.steps.task.heading = "Nhiệm vụ học tập";
  topic.steps.task.content = document.getElementById('admin-edit-task-desc').value;

  topic.steps.conclusion.heading = "Kết luận & Thông điệp";
  topic.steps.conclusion.content = document.getElementById('admin-edit-conclusion').value;
  topic.steps.conclusion.badge = document.getElementById('admin-edit-badge').value;

  topic.aiPersona.avatar = document.getElementById('admin-edit-botavatar').value;
  topic.aiPersona.name = document.getElementById('admin-edit-botname').value;
  topic.aiPersona.role = document.getElementById('admin-edit-botrole').value;
  topic.aiPersona.welcomeMsg = document.getElementById('admin-edit-botwelcome').value;
  topic.aiPersona.systemPrompt = document.getElementById('admin-edit-botprompt').value;

  localStorage.setItem('webquest_topics_v1', JSON.stringify(AppState.topics));
  alert('✓ ĐÃ LƯU BÀI HỌC THÀNH CÔNG!');
  document.getElementById('admin-edit-form-box').classList.add('hidden');
  renderAdminTopicsList();
  renderApp();
}

function deleteTopicInAdmin(topicId) {
  if (confirm('Thầy/Cô có chắc chắn muốn xóa bài học này không?')) {
    AppState.topics = AppState.topics.filter(t => t.id !== topicId);
    localStorage.setItem('webquest_topics_v1', JSON.stringify(AppState.topics));
    renderAdminTopicsList();
    renderApp();
  }
}

// Tab 3: Nhóm học sinh
function renderAdminGroupsInputs() {
  const container = document.getElementById('admin-groups-inputs');
  if (!container) return;

  const groups = AppState.siteConfig.groups || [];
  container.innerHTML = groups.map((g, idx) => `
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
      <input type="text" id="cfg-grp-icon-${idx}" value="${g.icon}" class="w-12 text-center p-2 rounded-lg border border-slate-300 text-lg">
      <input type="text" id="cfg-grp-name-${idx}" value="${g.name}" class="flex-1 p-2 rounded-lg border border-slate-300 text-sm font-semibold">
    </div>
  `).join('');
}

function saveGroupsConfig(e) {
  e.preventDefault();
  const groups = AppState.siteConfig.groups || [];
  groups.forEach((g, idx) => {
    const iconInput = document.getElementById(`cfg-grp-icon-${idx}`);
    const nameInput = document.getElementById(`cfg-grp-name-${idx}`);
    if (iconInput && nameInput) {
      g.icon = iconInput.value;
      g.name = nameInput.value;
    }
  });

  localStorage.setItem('webquest_site_config_v1', JSON.stringify(AppState.siteConfig));
  alert('✓ ĐÃ CẬP NHẬT DANH SÁCH NHÓM THÀNH CÔNG!');
  renderApp();
}

// Tab 4: Sao lưu & Khôi phục dữ liệu

function exportTopicsJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState.topics, null, 2));
  const a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", "topics.json");
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function exportSiteConfigJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState.siteConfig, null, 2));
  const a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", "site_config.json");
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function resetToFactoryDefault() {
  if (confirm('Thầy/Cô có muốn khôi phục lại toàn bộ dữ liệu gốc của website theo SGK không?')) {
    localStorage.removeItem('webquest_topics_v1');
    localStorage.removeItem('webquest_site_config_v1');
    localStorage.removeItem('webquest_submissions_v1');
    location.reload();
  }
}

// -------------------------------------------------------------
// 7. HIỆU ỨNG PHÁO HOA CHÚC MỪNG (CONFETTI)
// -------------------------------------------------------------
let confettiCanvas, confettiCtx, confettiParticles = [];

function initConfettiCanvas() {
  confettiCanvas = document.getElementById('confetti-canvas');
  if (confettiCanvas) {
    confettiCtx = confettiCanvas.getContext('2d');
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);
  }
}

function resizeConfettiCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function fireConfetti() {
  if (!confettiCanvas) return;
  confettiParticles = [];
  const colors = ['#2E4057', '#7D5A38', '#8C3838', '#205493', '#2D5A46', '#F59E0B', '#10B981'];

  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      w: Math.random() * 8 + 4,
      h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16 - 4,
      gravity: 0.25,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10
    });
  }

  animateConfetti();
}

function animateConfetti() {
  if (confettiParticles.length === 0) {
    if (confettiCtx) confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    return;
  }

  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.vRotation;

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();

    if (p.y > window.innerHeight) {
      confettiParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(animateConfetti);
}
