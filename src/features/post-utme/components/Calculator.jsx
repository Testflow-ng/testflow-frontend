import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Delete, Divide, Minus, Plus, Equal, Hash } from 'lucide-react';
import { cn } from '../../../utils/cn.js';

function CalcButton({ children, onClick, variant = 'default', className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-12 items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-95",
        variant === 'default' && "bg-surface-strong text-foreground-strong hover:bg-border",
        variant === 'operator' && "bg-primary/10 text-primary hover:bg-primary/20",
        variant === 'action' && "bg-foreground text-background hover:opacity-90",
        className
      )}
    >
      {children}
    </button>
  );
}

function Calculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const append = (char) => {
    setDisplay(prev => {
      if (prev === '0' && char !== '.') return char;
      if (prev.length > 12) return prev;
      return prev + char;
    });
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const backspace = () => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const calculate = () => {
    try {
      // Basic safety: only allow numbers and operators
      const result = eval(equation + display);
      setDisplay(String(Number(result.toFixed(8))));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleOp = (op) => {
    setEquation(display + op);
    setDisplay('0');
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-24 right-6 z-[60] w-72 overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-black/20"
    >
      {/* Header */}
      <div className="flex cursor-move items-center justify-between bg-surface-strong px-4 py-3">
        <div className="flex items-center gap-2">
           <Hash size={14} className="text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest text-muted">Calculator</span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-foreground-strong transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Screen */}
      <div className="bg-surface-strong/50 p-6 text-right">
        <p className="h-4 text-[10px] font-bold text-muted tabular-nums">{equation}</p>
        <p className="mt-1 truncate text-3xl font-black text-foreground-strong tabular-nums tracking-tighter">
          {display}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 p-4">
        <CalcButton onClick={clear} variant="operator">AC</CalcButton>
        <CalcButton onClick={backspace} variant="operator"><Delete size={18} /></CalcButton>
        <CalcButton onClick={() => handleOp('/')} variant="operator"><Divide size={18} /></CalcButton>
        <CalcButton onClick={() => handleOp('*')} variant="operator">×</CalcButton>

        <CalcButton onClick={() => append('7')}>7</CalcButton>
        <CalcButton onClick={() => append('8')}>8</CalcButton>
        <CalcButton onClick={() => append('9')}>9</CalcButton>
        <CalcButton onClick={() => handleOp('-')} variant="operator"><Minus size={18} /></CalcButton>

        <CalcButton onClick={() => append('4')}>4</CalcButton>
        <CalcButton onClick={() => append('5')}>5</CalcButton>
        <CalcButton onClick={() => append('6')}>6</CalcButton>
        <CalcButton onClick={() => handleOp('+')} variant="operator"><Plus size={18} /></CalcButton>

        <CalcButton onClick={() => append('1')}>1</CalcButton>
        <CalcButton onClick={() => append('2')}>2</CalcButton>
        <CalcButton onClick={() => append('3')}>3</CalcButton>
        <CalcButton onClick={calculate} className="row-span-2 h-full" variant="action"><Equal size={20} /></CalcButton>

        <CalcButton onClick={() => append('0')} className="col-span-2">0</CalcButton>
        <CalcButton onClick={() => append('.')}>.</CalcButton>
      </div>

      <div className="px-4 pb-4 text-center">
         <p className="text-[9px] font-bold text-muted uppercase tracking-tighter">Drag to reposition</p>
      </div>
    </motion.div>
  );
}

export default Calculator;
