import React, { useMemo } from 'react';
import {
    // Navigation
    Target,
    Sandwich,
    Package,
    SquareStack,
    Gamepad2,
    Settings,
    Lock,

    // Stats
    Coins,
    Zap,
    Heart,
    Trophy,
    Skull,
    BarChart2,
    Swords,
    Timer,
    Crosshair,
    Globe,
    Atom,

    // Actions
    Check,
    X,
    Plus,
    Trash2,
    Edit2,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Search,
    Share2,

    // Habits - Food
    Apple,
    Banana,
    Carrot,
    Croissant,
    Drumstick,
    Cookie,
    Coffee,
    Utensils,
    Pizza,
    Beer,
    Milk,
    Grape,
    Beef, // Using Beef for steak/meat if available, or fallback
    Egg,

    // Habits - Tools/Chores
    CarFront,
    Hammer,
    Wrench,
    Bed,
    ShowerHead,
    Briefcase,
    CreditCard,
    Banknote,
    Armchair, // Sofa/Furniture
    Sparkles, // Cleaning?
    // Trash, // Alternative trash - REMOVED: unused

    // Habits - Nature
    Trees,
    Flame,
    Droplet,
    Sun,
    Moon,
    Wind,
    CloudRain,
    Flower2,
    Mountain,

    // Habits - Activities/Health
    Dumbbell,
    Book,
    Brain,
    Music,
    Palette,
    Code,
    Pill,
    Activity,
    Smartphone,
    Smile,
    Bike,
    Footprints,

    // Other
    Shield,
    Star,
    HelpCircle,
    AlertCircle,
    type LucideProps
} from 'lucide-react';
import './RetroIcon.css';

export type IconName =
    // Navigation & Core
    | 'target'
    | 'burger'
    | 'crate'
    | 'cards'
    | 'gamepad'
    | 'settings'
    | 'lock'

    // Stats
    | 'coin'
    | 'bolt'
    | 'heart'
    | 'trophy'
    | 'skull'
    | 'stats'
    | 'attack'
    | 'speed'
    | 'range'
    | 'globe'
    | 'atom'

    // Actions
    | 'check'
    | 'cross'
    | 'plus'
    | 'trash'
    | 'edit'
    | 'arrow-right'
    | 'chevron-left'
    | 'chevron-right'
    | 'search'
    | 'share'

    // Food
    | 'apple'
    | 'banana'
    | 'carrot'
    | 'bread'
    | 'chicken'
    | 'cookie'
    | 'coffee'
    | 'utensils'
    | 'pizza'
    | 'beer'
    | 'milk'
    | 'grape'
    | 'meat'
    | 'egg'

    // Tools & Chores
    | 'car'
    | 'hammer'
    | 'wrench'
    | 'bed'
    | 'shower'
    | 'briefcase'
    | 'credit-card'
    | 'cash'
    | 'sofa'
    | 'clean'

    // Nature
    | 'tree'
    | 'fire'
    | 'water'
    | 'sun'
    | 'moon'
    | 'wind'
    | 'rain'
    | 'flower'
    | 'mountain'

    // Activities & Health
    | 'weights'
    | 'book'
    | 'mind'
    | 'music'
    | 'art'
    | 'code'
    | 'pill'
    | 'run'
    | 'phone'
    | 'happy'
    | 'bike'
    | 'walk'

    // Other
    | 'shield'
    | 'star'
    | 'question'
    | 'alert';

export interface RetroIconProps extends Omit<LucideProps, 'color'> {
    name: IconName;
    size?: number;
    color?: string;
    className?: string;
    glow?: boolean;
    style?: React.CSSProperties;
}

const ICON_MAP: Record<IconName, React.ElementType> = {
    // Navigation
    target: Target,
    burger: Sandwich,
    crate: Package,
    cards: SquareStack,
    gamepad: Gamepad2,
    settings: Settings,
    lock: Lock,

    // Stats
    coin: Coins,
    bolt: Zap,
    heart: Heart,
    trophy: Trophy,
    skull: Skull,
    stats: BarChart2,
    attack: Swords,
    speed: Timer,
    range: Crosshair,
    globe: Globe,
    atom: Atom,

    // Actions
    check: Check,
    cross: X,
    plus: Plus,
    trash: Trash2,
    edit: Edit2,
    'arrow-right': ArrowRight,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    search: Search,
    share: Share2,

    // Food
    apple: Apple,
    banana: Banana,
    carrot: Carrot,
    bread: Croissant, // Closest to bread
    chicken: Drumstick,
    cookie: Cookie,
    coffee: Coffee,
    utensils: Utensils,
    pizza: Pizza,
    beer: Beer,
    milk: Milk,
    grape: Grape,
    meat: Beef, // Or generic meat
    egg: Egg,

    // Tools & Chores
    car: CarFront,
    hammer: Hammer,
    wrench: Wrench,
    bed: Bed,
    shower: ShowerHead,
    briefcase: Briefcase,
    'credit-card': CreditCard,
    cash: Banknote,
    sofa: Armchair,
    clean: Sparkles,

    // Nature
    tree: Trees,
    fire: Flame,
    water: Droplet,
    sun: Sun,
    moon: Moon,
    wind: Wind,
    rain: CloudRain,
    flower: Flower2,
    mountain: Mountain,

    // Activities
    weights: Dumbbell,
    book: Book,
    mind: Brain,
    music: Music,
    art: Palette,
    code: Code,
    pill: Pill,
    run: Activity,
    phone: Smartphone,
    happy: Smile,
    bike: Bike,
    walk: Footprints,

    // Other
    shield: Shield,
    star: Star,
    question: HelpCircle,
    alert: AlertCircle
};

export default function RetroIcon({ name, size = 24, color = 'currentColor', className = '', glow = true, style, ...rest }: RetroIconProps) {
    const IconComponent = ICON_MAP[name];

    const memoizedIcon = useMemo(() => {
        if (!IconComponent) {
            console.warn(`Icon "${name}" not found`);
            return <HelpCircle size={size} color={color} className={className} style={style} />;
        }

        return (
            <IconComponent
                size={size}
                color={color}
                className={`retro-icon ${glow ? 'retro-icon--glow' : ''} ${className}`}
                style={style}
                strokeWidth={2} // Default stroke width for retro feel
                {...rest}
            />
        );
    }, [IconComponent, name, size, color, className, glow, style, rest]);

    return memoizedIcon;
}
