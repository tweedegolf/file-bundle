
export default class TaskRunner{

  /**
   * Constructs the taskRunner
   */
  constructor(){
    // the currently running task
    this.taskIndex = -1
  }

  configure(tasks, onReady){
    /*
     * Array containing references to the task functions, will be populated at the
     * bottom of this file, after the task function are declared
     *
     * @type       {Array}
     */
    this.tasks = tasks
    this.onReady = onReady
  }

  /**
   * Runs all tasks
   *
   * @param      {Object}  extraArgs  Optional data that is passed over from one
   *                                  task to another
   */
  runTask(extraArgs){
    this.taskIndex++
    console.log(this.taskIndex, this.tasks.length)
    if(this.taskIndex < this.tasks.length){
      let task = this.tasks[this.taskIndex]
      task.func({...task.args, ...extraArgs})
    }else{
      this.onReady()
    }
  }
}
