export interface Task {
  title: string;
  priority: string;
  estimatedDays: string;
}

export interface Module {
  module: string;
  tasks: Task[];
}

export interface Workflow {
  projectName: string;
  modules: Module[];
}