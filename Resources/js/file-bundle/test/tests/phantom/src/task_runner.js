
export default class TaskRunner {

  /**
   * Constructs the taskRunner
   */
    constructor() {
        this.taskIndex = -1;
    }

  /**
   * Configure the task runner before you can start it
   *
   * @param      {Object}    conf        The configuration
   * @property   {array}     tasks       Array of task objects, a task object
   *                                     has 2 mandatory properties 'id' and
   *                                     'func' and one optional property 'args'
   * @property   {function}  onReady     Called after the task is done
   * @property   {number}    startIndex  The index of the task to start with;
   *                                     startIndex and endIndex allow you so
   *                                     run a subset of tasks
   * @property   {number}    maxIndex    The index of the last task
   * @property   {boolean}   debug       If true, information about the current
   *                                     task is printed to the console (don't
   *                                     use this i.c.w. jasmine testing)
   */
    configure(conf) {
        const {
      tasks,
      onReady,
      startIndex = 0,
      maxIndex = tasks.length,
      debug = false,
    } = conf;
        Object.assign(this, { tasks, onReady, startIndex, maxIndex, debug });
        return this;
    }

  /**
   * Runs all tasks
   *
   * @param      {Object}  extraArgs  Optional data that is passed over from one
   *                                  task to another
   */
    runTask(extraArgs) {
        this.taskIndex++;
        if (this.taskIndex < this.maxIndex) {
            const task = this.tasks[this.taskIndex];
            if (this.debug === true) {
                console.log(`running task ${task.id} (${this.taskIndex} of ${this.maxIndex})`);
            }
            task.func({ id: task.id, ...task.args, ...extraArgs });
        } else {
            this.onReady();
        }
    }
}
