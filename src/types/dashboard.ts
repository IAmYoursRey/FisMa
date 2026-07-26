export interface SubjectCardInfo {
  id: 'fisika' | 'matematika';
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  gameCount: number;
  solverCount: number;
  status: 'Development' | 'Ready' | 'Coming Soon';
  topics: string[];
  gradientColor: string;
}

export interface PlatformStat {
  id: string;
  label: string;
  value: string | number;
  description: string;
  iconName: string;
  statusBadge?: string;
}
