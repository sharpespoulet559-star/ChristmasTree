import { ImageConfig } from './types';

// Updated EMOJIS list
export const EMOJIS = ['🎁', '🔔', '🎄', '🎅', '🦌', '❄️', '⭐', '👔', '🧦', '🧸', '🍪', '🕯️'];

// New Geometry Shapes configuration
export const GEOMETRY_SHAPES = ['sphere', 'cube', 'tetrahedron', 'tree'];

// ==========================================
// 2. 本地图片目录配置 (Directory Configuration)
// ==========================================
// 注意：Web 浏览器出于安全原因，无法直接读取硬盘上的文件夹内容。
// 方法 A: 将图片放入 public/images/ 文件夹，并在此处配置文件名。
// 方法 B: 如果图片命名有规律（如 img_1.jpg ... img_100.jpg），可以使用序列配置自动生成。
// ==========================================

const DIRECTORY_CONFIG = {
  // 基础路径，对应 public 文件夹下的目录
  BASE_PATH: '/images/', 

  // 选项 1: 自动序列生成 (如果您的图片是按数字顺序命名的)
  SEQUENCE: {
    ENABLED: false,      // 设置为 true 以启用自动生成
    PREFIX: 'img_',      // 文件名前缀
    EXTENSION: '.jpg',   // 文件扩展名
    START_INDEX: 1,      // 开始序号
    END_INDEX: 20        // 结束序号
  },

  // 选项 2: 手动指定文件名列表 (如果文件名没有规律)
  FILE_NAMES: [
     // 'my-photo.jpg', 
     // 'christmas.png'
  ]
};

// ==========================================
// 逻辑处理：生成图片列表
// ==========================================
const generatedImages: ImageConfig[] = [];

// 1. 处理自动序列
if (DIRECTORY_CONFIG.SEQUENCE.ENABLED) {
  const { PREFIX, EXTENSION, START_INDEX, END_INDEX } = DIRECTORY_CONFIG.SEQUENCE;
  for (let i = START_INDEX; i <= END_INDEX; i++) {
    generatedImages.push({
      id: `seq_img_${i}`,
      url: `${DIRECTORY_CONFIG.BASE_PATH}${PREFIX}${i}${EXTENSION}`
    });
  }
}

// 2. 处理手动列表
if (DIRECTORY_CONFIG.FILE_NAMES.length > 0) {
  DIRECTORY_CONFIG.FILE_NAMES.forEach((fileName, index) => {
    generatedImages.push({
      id: `manual_img_${index}`,
      url: `${DIRECTORY_CONFIG.BASE_PATH}${fileName}`
    });
  });
}

// 默认网络图片备份 (如果上述配置均为空)
const DEFAULT_ONLINE_IMAGES = [
  'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1576618148400-f54bed99fcf8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1482517967863-00e15c9b4499?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511268011861-691ed6d90362?auto=format&fit=crop&w=600&q=80',
];

// 最终导出
export const PRELOADED_IMAGES: ImageConfig[] = generatedImages.length > 0 
  ? generatedImages 
  : DEFAULT_ONLINE_IMAGES.map((url, index) => ({ id: `def_img_${index}`, url }));


// 1. 粒子数量
export const PARTICLE_COUNT = 350; 

// 树尺寸
export const TREE_HEIGHT = 50;     
export const TREE_RADIUS = 22;     
export const GALAXY_RADIUS = 70; 

// 颜色配置
export const COLORS = ['#FF0000', '#00FF00', '#FFD700', '#FFFFFF', '#1E90FF', '#FF69B4'];