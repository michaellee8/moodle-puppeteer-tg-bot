async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function dumpFrameTree(frame, indent) {
  console.log(indent + frame.url());
  for (let child of frame.childFrames()) dumpFrameTree(child, indent + "  ");
}

function delay(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

function isLessonQuiz(name) {
  if (name === `In-class classwork EXAMPLE`) {
    return false;
  }
  if (name === `Tutorial Assignment EXAMPLE`) {
    return false;
  }
  if (name.match(/Tutorial.*Assignment Submission/) != null) {
    return false;
  }
  return true;
}

module.exports = { asyncForEach, dumpFrameTree, delay, isLessonQuiz };
