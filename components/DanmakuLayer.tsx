
import React, { useEffect, useState } from 'react';
import { DanmakuMessage } from '../types';

const DANMAKU_SAMPLES = [
  "这个观点绝了！", "陈老师加油！", "马薇薇又在扎心了...", "这逻辑我跪了",
  "少爷杀我！", "说得好！", "逻辑闭环了属于是", "这个梗我能笑一天",
  "哈佛才女真稳", "这就是奇葩说现场吗？", "针锋相对啊！", "有点意思",
  "前方高能", "全场起立！", "太强了这波分析", "教练，我也想学辩论"
];

const DanmakuLayer: React.FC = () => {
  const [items, setItems] = useState<DanmakuMessage[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem: DanmakuMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text: DANMAKU_SAMPLES[Math.floor(Math.random() * DANMAKU_SAMPLES.length)],
        top: Math.floor(Math.random() * 80) + 5,
        color: `hsl(${Math.random() * 360}, 70%, 75%)`,
        speed: 8 + Math.random() * 12
      };
      setItems(prev => [...prev.slice(-15), newItem]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map(item => (
        <div
          key={item.id}
          className="danmaku-item text-sm md:text-base font-bold drop-shadow-lg opacity-40"
          style={{
            top: `${item.top}%`,
            color: item.color,
            animationDuration: `${item.speed}s`
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default DanmakuLayer;
