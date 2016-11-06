
export default class TaskRunner{

  /**
   * Constructs the taskRunner
   */
  constructor(){
    this.taskIndex = -1
  }

  /**
   * Configure the task runner before you can start it
   *
   * @param      {array}     tasks        Array of task objects, a task object
   *                                      has 2 mandatory properties 'id' and
   *                                      'func' and one optional property
   *                                      'args'
   * @param      {function}  onReady      Called after the task is done
   * @param      {number}    taskIndexes  The indexes of the tasks in the tasks
   *                                      array that will actually run; this
   *                                      allows you to run a subset of the
   *                                      tasks.
   */
  configure(tasks, onReady, taskIndexes){
    this.tasks = tasks
    this.onReady = onReady
    this.taskIndexes = taskIndexes
    this.maxIndex = taskIndexes.length
  }

  /**
   * Runs all tasks
   *
   * @param      {Object}  extraArgs  Optional data that is passed over from one
   *                                  task to another
   */
  runTask(extraArgs){
    this.taskIndex++
    if(this.taskIndex < this.maxIndex){
      let index = this.taskIndexes[this.taskIndex]
      let task = this.tasks[index]
      console.log(`running task ${task.id} (${this.taskIndex} of ${this.maxIndex})`)
      task.func({id: task.id, ...task.args, ...extraArgs})
    }else{
      this.onReady()
    }
  }
}
