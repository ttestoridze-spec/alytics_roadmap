import { useState, useEffect } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);
  const [animatedBars, setAnimatedBars] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedBars(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: '📊',
      title: 'Аналитика в реальном времени',
      description: 'Отслеживайте метрики и KPI в режиме реального времени с минимальной задержкой.',
    },
    {
      icon: '🤖',
      title: 'AI-прогнозирование',
      description: 'Используйте машинное обучение для прогнозирования трендов и аномалий.',
    },
    {
      icon: '🔗',
      title: 'Интеграции',
      description: 'Подключайте более 200+ источников данных: CRM, ERP, базы данных, API.',
    },
    {
      icon: '📱',
      title: 'Мобильный доступ',
      description: 'Полный доступ к дашбордам и отчётам с любого устройства.',
    },
    {
      icon: '🔒',
      title: 'Безопасность',
      description: 'Шифрование данных, RBAC, аудит действий и соответствие стандартам.',
    },
    {
      icon: '⚡',
      title: 'Высокая скорость',
      description: 'Обработка миллионов записей за секунды благодаря оптимизированному движку.',
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '500+', label: 'Клиентов' },
    { value: '2M+', label: 'Запросов/день' },
    { value: '<50ms', label: 'Отклик' },
  ];

  const pricing = [
    {
      name: 'Стартер',
      price: '0',
      period: 'навсегда',
      features: ['До 3 пользователей', '5 дашбордов', '1 ГБ хранилище', 'Email поддержка'],
      highlighted: false,
    },
    {
      name: 'Про',
      price: '2 990',
      period: '/мес',
      features: ['До 25 пользователей', 'Безлимитные дашборды', '100 ГБ хранилище', 'AI-аналитика', 'Приоритетная поддержка'],
      highlighted: true,
    },
    {
      name: 'Корпоративный',
      price: 'По запросу',
      period: '',
      features: ['Безлимит пользователей', 'On-premise развёртывание', 'SLA 99.99%', 'Выделенный менеджер', 'Кастомные интеграции'],
      highlighted: false,
    },
  ];

  const chartData = [65, 45, 78, 52, 89, 67, 95, 72, 84, 60, 91, 78];
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-gray-950/95 backdrop-blur-md shadow-lg shadow-purple-500/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-lg">
              SA
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Alytics
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Возможности</a>
            <a href="#dashboard" className="text-gray-300 hover:text-white transition-colors">Дашборд</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Тарифы</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Контакты</a>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Начать бесплатно
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-purple-300">Версия 3.0 — Уже доступна</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Аналитика нового
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              поколения
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            SA Alytics — платформа для сбора, анализа и визуализации данных.
            Принимайте решения на основе данных, а не интуиции.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5">
              Попробовать бесплатно →
            </button>
            <button className="w-full sm:w-auto border border-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
              Смотреть демо
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Возможности
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Всё необходимое для полной аналитики вашего бизнеса в одном месте
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/30 hover:bg-gray-900/80 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Demo Section */}
      <section id="dashboard" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Интерактивный дашборд
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Наглядная визуализация данных с гибкой настройкой
            </p>
          </div>

          {/* Dashboard mockup */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 md:p-8 overflow-hidden">
            {/* Dashboard header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold">Обзор метрик</h3>
                <p className="text-gray-500 text-sm">Последнее обновление: только что</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">● Live</span>
                <button className="px-4 py-1.5 bg-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                  Экспорт
                </button>
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Выручка', value: '₽12.4M', change: '+12.5%', positive: true },
                { label: 'Пользователи', value: '48,291', change: '+8.3%', positive: true },
                { label: 'Конверсия', value: '3.24%', change: '-0.4%', positive: false },
                { label: 'Ср. чек', value: '₽2,847', change: '+5.1%', positive: true },
              ].map((metric, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <p className={`text-sm mt-1 ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-medium">Динамика роста</h4>
                <div className="flex gap-2">
                  {['7Д', '1М', '3М', '1Г'].map((period, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        i === 2 ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Bar chart */}
              <div className="flex items-end justify-between gap-2 h-48">
                {chartData.map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-1000 ease-out ${
                        animatedBars ? '' : 'h-0'
                      }`}
                      style={{
                        height: animatedBars ? `${value}%` : '0%',
                        background: `linear-gradient(to top, rgba(139, 92, 246, 0.6), rgba(6, 182, 212, 0.8))`,
                        transitionDelay: `${i * 100}ms`,
                      }}
                    ></div>
                    <span className="text-xs text-gray-500">{months[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity table */}
            <div className="mt-6 bg-gray-800/30 border border-gray-700/30 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-700/30">
                <h4 className="font-medium">Последние события</h4>
              </div>
              <div className="divide-y divide-gray-700/30">
                {[
                  { event: 'Новый пользователь зарегистрирован', time: '2 мин назад', type: 'user' },
                  { event: 'Отчёт сформирован', time: '15 мин назад', type: 'report' },
                  { event: 'Обнаружена аномалия в трафике', time: '1 час назад', type: 'alert' },
                  { event: 'Интеграция с CRM обновлена', time: '3 часа назад', type: 'system' },
                ].map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === 'user' ? 'bg-blue-400' :
                        item.type === 'report' ? 'bg-green-400' :
                        item.type === 'alert' ? 'bg-yellow-400' : 'bg-purple-400'
                      }`}></div>
                      <span className="text-sm text-gray-300">{item.event}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Тарифные планы
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Выберите план, который подходит вашему бизнесу
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-purple-900/40 to-gray-900/80 border-2 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ПОПУЛЯРНЫЙ
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 'По запросу' ? '' : '₽'}{plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-lg hover:shadow-purple-500/25'
                      : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {plan.price === 'По запросу' ? 'Связаться' : 'Начать'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-b from-purple-900/30 to-gray-900/50 border border-purple-500/20 rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Готовы начать?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Присоединяйтесь к 500+ компаниям, которые уже используют SA Alytics для принятия решений на основе данных.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5">
                  Начать бесплатно
                </button>
                <button className="w-full sm:w-auto border border-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-purple-500/50 transition-all">
                  Запросить демо
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-sm">
                  SA
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Alytics
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Платформа аналитики нового поколения для бизнеса любого масштаба.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Продукт</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Возможности</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Интеграции</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Тарифы</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Компания</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-purple-400 transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Блог</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Карьера</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Контакты</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Поддержка</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Документация</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Статус</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Сообщество</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">© 2026 SA Alytics. Все права защищены.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition-all">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition-all">
                <i className="fab fa-telegram"></i>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition-all">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
