import ModuleIntro from '../../components/ModuleIntro.jsx';
import { TIZHI_VALIDATION } from './data.js';

export default function TizhiModule() {
  return (
    <div className="space-y-4 font-body">
      <ModuleIntro
        moduleId="tizhi"
        origin="历史版本使用了未完整实现标准条目的简化问卷，当前正在按正式量表与医疗安全要求重建。"
        strengths="标准来源、完整条目、判定规则与调养安全全部通过后再开放"
      />

      <div className="border border-[var(--color-cinnabar)]/40 bg-[var(--color-cinnabar)]/10 p-3 text-sm text-[var(--color-text)]">
        <div className="font-title text-[var(--color-cinnabar)] mb-1">验证未通过，功能暂停</div>
        <div className="text-xs text-[var(--color-text-dim)]">{TIZHI_VALIDATION.reason}</div>
      </div>

      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4 text-xs text-[var(--color-text-dim)] space-y-2">
        <div>核验基准：{TIZHI_VALIDATION.canonicalStandard}</div>
        <div>旧问卷：{TIZHI_VALIDATION.historicalQuestionCount} 题；标准量表：{TIZHI_VALIDATION.canonicalQuestionCount} 题。</div>
        <div>旧版药茶、药量、按穴与艾灸方案已从运行时移除，待逐项来源与禁忌复核。</div>
      </div>
    </div>
  );
}
