// Скрипт для динамического создания фавикона с буквой "А"
(function() {
  // Создаем canvas элемент
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  
  // Получаем контекст для рисования
  const ctx = canvas.getContext('2d');
  
  // Рисуем фон (синий прямоугольник с закругленными углами)
  ctx.fillStyle = '#4a86e8';
  ctx.beginPath();
  ctx.roundRect(0, 0, 32, 32, 4);
  ctx.fill();
  
  // Настраиваем стиль текста
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Рисуем букву "А"
  ctx.fillText('А', 16, 16);
  
  // Создаем ссылку на фавикон
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = canvas.toDataURL('image/png');
  
  // Добавляем ссылку в head
  document.head.appendChild(link);
})();
