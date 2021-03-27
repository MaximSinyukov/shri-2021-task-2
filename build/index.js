// необходимо для разработки
// const fs = require('fs');
// const path = require('path');
// // const pathdataJson = path.join(__dirname, '../examples/input-vloj.json');
// const pathdataJson = path.join(__dirname, '../examples/input.json');
// const outputdataJson = path.join(__dirname, '../examples/example-output.json');
// const dataJson = fs.readFileSync(pathdataJson);
// const dataInput = JSON.parse(dataJson);


function prepareData(data, sprint) {
  let  userList = {}, sprintsList = {};
  const resultArray = [], summaryList = {}, commitArray = [], commentArray = [], currentChange = {100: 0, 500: 0, 1000: 0, 1001: 0}, previousChange = {100: 0, 500: 0, 1000: 0, 1001: 0}, activityData = Array(168).fill(0);

  //функция распределяет передающиеся элементы и вызывает себя же при вложенности
  function distributeData(item) {
    function checkObj(arr) {
      arr.forEach((value) => {
        if(typeof value === 'object') {
          distributeData(value);
        }
      });
    }

    if(item.type === 'User') {
      userList[item.id] = item;
      userList[item.id].valueText = 0;
      userList[item.id].likes = 0;
      checkObj(item.friends);
      checkObj(item.commits);
      checkObj(item.comments);
    }

    if(item.type === 'Sprint') {
      sprintsList[item.id] = item;
      sprintsList[item.id].value = 0;
    }

    if(item.type === 'Summary') {
      summaryList[item.id] = item;
      //сразу получаем размер саммариса
      summaryList[item.id].change = item.added + item.removed;
      checkObj(item.comments);
    }

    if(item.type === 'Comment') {
      checkObj(item.likes);
      if(typeof item.author === 'object') {
        distributeData(item.author);
      }
      commentArray.push(item);
    }

    if(item.type === 'Commit') {
      checkObj(item.summaries);
      if(typeof item.author === 'object') {
        distributeData(item.author);
      }
      commitArray.push(item);
    }

    if(item.type === 'Issue') {
      checkObj(item.comments);
      if(typeof item.resolvedBy === 'object') {
        distributeData(item.resolvedBy);
      }
    }

    if(item.type === 'Project') {
      checkObj(item.issues);
      checkObj(item.commits);
      checkObj(item.dependencies);
    }
  }

  data.forEach((dataItem) => {
    distributeData(dataItem);
  });

  commentArray.forEach((item) => {
    //находим лайки за текущий спринт для каждого пользователя
    if((sprintsList[sprint.sprintId].startAt <= item.createdAt)&&(item.createdAt <= sprintsList[sprint.sprintId].finishAt)) {
      //если в свойстве будет лежать объект
      userList[(typeof item.author) === 'object' ? item.author.id : item.author].likes += item.likes.length;
    }
  });

  //запоминаем нужные значения, т.к. дальше будет преобразование в массив и сортировка по id
  const previousSprint = sprintsList[sprint.sprintId - 1];
  const currentSprint = sprintsList[sprint.sprintId];
  sprintsList = Object.values(sprintsList);

  //будем использовать бинарный поиск для уменьшения итераций в переборе спринтов, т.к. они уже отсортированы по времени
  function binarySearch(sortedNumbers, n) {
  let start = 0;
  let end = sortedNumbers.length;
  while (start < end) {
    const middle = Math.floor((start + end) / 2);
    const valueStart = sortedNumbers[middle].startAt;
    const valueEnd = sortedNumbers[middle].finishAt;

    if ((n <= valueEnd)&&(n >= valueStart)) {
      return middle;
    }

    if (n < valueStart) {
      end = middle;
    } else if (n > valueEnd) {
      start = middle + 1;
    }
  }
  return -1;
  }

  commitArray.forEach((item) => {
    //находим объект спринта в массиве спринтов
    const sprintItem = sprintsList[binarySearch(sprintsList, item.timestamp)];
    //плюсуем коммиты к каждому спринту
    sprintItem.value++;

    //для шаблона diagram собираем информацию по прошлому спринту
    if (sprintItem.id === sprint.sprintId - 1) {
      //находим размер коммита в строках и записываем значение в свойства объекта для подсчета разницы последних спринтов
      const sumString = item.summaries.reduce((prev, summary) => {
        return prev += summaryList[typeof summary === 'object' ? summary.id : summary].change;
      }, 0);
      if(sumString <= 100) {
        previousChange['100']++;
      } else if(sumString <= 500) {
        previousChange['500']++;
      } else if(sumString <= 1000) {
        previousChange['1000']++;
      } else {
        previousChange['1001']++;
      }
    }

    //собираем информацию по текущему спринту
    if(sprintItem.id === sprint.sprintId) {
      userList[typeof item.author === 'object' ? item.author.id : item.author].valueText++;
      const sumString = item.summaries.reduce((prev, summary) => {
        return prev += summaryList[typeof summary === 'object' ? summary.id : summary].change;
      }, 0);
      if(sumString <= 100) {
        currentChange['100']++;
      } else if(sumString <= 500) {
        currentChange['500']++;
      } else if(sumString <= 1000) {
        currentChange['1000']++;
      } else {
        currentChange['1001']++;
      }

      //собираем информацию в часах для тепловой карты текущего спринта в виде массива длинной 168
      const commitTime = ((new Date(item.timestamp)).getDay() - (new Date(sprintItem.startAt)).getDay())*24 + (new Date(item.timestamp)).getHours();
      activityData[commitTime]++;
    }
  });

  //для удобства перебора пользователей в шаблонах образуем массив пользователей
  userList = Object.values(userList);

  //
  function setEnding(number) {
    const endingsArray = {one: '', two: 'а', three: 'ов'};
    const remainderTens = number % 10;
    const remainderHundred = number % 100;
    if ((4 < number)&&(number < 21)||(remainderTens === 0)||(remainderHundred > 4)&&(remainderHundred < 21)||(remainderTens > 4)&&(remainderTens < 21)) {
      return `${endingsArray.three}`
    } else if ((number === 1)||(remainderTens === 1)) {
      return `${endingsArray.one}`
    } else {
      return `${endingsArray.two}`
    }
  }

  //сортируем по количеству коммитов
  userList.sort((a, b) => {
    b = b.valueText;
    a = a.valueText;
    return b - a;
  });

  //повтор информации в шаблонах leaders и chart, плюс дальше у нас еще одна сортировка по лайкам
  const usersCommit = userList.map((user) => {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      valueText: String(user.valueText)
    };
  });

  userList.sort((a, b) => {
    b = b.likes;
    a = a.likes;
    return b - a;
  });

  resultArray.push({
    alias: 'leaders',
    data: {
      title: 'Больше всего коммитов',
      subtitle: `${currentSprint.name}`,
      emoji: '👑',
      users: usersCommit
    }
  });

  resultArray.push({
    alias: 'vote',
    data: {
      title: 'Самый 🔎 внимательный разработчик',
      subtitle: `${currentSprint.name}`,
      emoji: '🔎',
      users: userList.map((user) => {
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          valueText: `${user.likes} голос${setEnding(user.likes)}`
        };
      })
    }
  });

  resultArray.push({
    alias: 'chart',
    data: {
      title: 'Коммиты',
      subtitle: `${currentSprint.name}`,
      values: sprintsList.map((item) => {
        if(sprint.sprintId === item.id) {
          return {
            title: String(item.id),
            hint: item.name,
            value: item.value,
            active: true
          }
        }
        return {
          title: String(item.id),
          hint: item.name,
          value: item.value,
        };
      }),
      users: usersCommit
    }
  });

  resultArray.push({
    alias: 'diagram',
    data: {
      title: 'Размер коммитов',
      subtitle: `${currentSprint.name}`,
      totalText: `${currentSprint.value} коммит${setEnding(currentSprint.value)}`,
      differenceText: `${currentSprint.value > previousSprint.value ? '+' : ''}${currentSprint.value - previousSprint.value} с прошлого спринта`,
      categories: [
        {title: '> 1001 строки', valueText: `${currentChange['1001']} коммит${setEnding(currentChange['1001'])}`, differenceText: `${currentChange['1001'] > previousChange['1001'] ? '+' : ''}${currentChange['1001'] - previousChange['1001']} коммит${setEnding(Math.abs(currentChange['1001'] - previousChange['1001']))}`},
        {title: '501 — 1000 строк', valueText: `${currentChange['1000']} коммит${setEnding(currentChange['1000'])}`, differenceText: `${currentChange['1000'] > previousChange['1000'] ? '+' : ''}${currentChange['1000'] - previousChange['1000']} коммит${setEnding(Math.abs(currentChange['1000'] - previousChange['1000']))}`},
        {title: '101 — 500 строк', valueText: `${currentChange['500']} коммит${setEnding(currentChange['500'])}`, differenceText: `${currentChange['500'] > previousChange['500'] ? '+' : ''}${currentChange['500'] - previousChange['500']} коммит${setEnding(Math.abs(currentChange['500'] - previousChange['500']))}`},
        {title: '1 — 100 строк', valueText: `${currentChange['100']} коммит${setEnding(currentChange['100'])}`, differenceText: `${currentChange['100'] > previousChange['100'] ? '+' : ''}${currentChange['100'] - previousChange['100']} коммит${setEnding(Math.abs(currentChange['100'] - previousChange['100']))}`}
      ]
    }
  });

  resultArray.push({
    alias: 'activity',
    data: {
      title: 'Коммиты',
      subtitle: `${currentSprint.name}`,
      data: {
        sun: activityData.slice(0, 24),
        mon: activityData.slice(24, 48),
        tue: activityData.slice(48, 72),
        wed: activityData.slice(72, 96),
        thu: activityData.slice(96, 120),
        fri: activityData.slice(120, 144),
        sat: activityData.slice(144, 168)
      }
    }
  });

  return resultArray;
}

// необходимо для разработки

// const oleg = JSON.stringify(prepareData(dataInput, { sprintId: 977}), null, 2);

// fs.writeFile(outputdataJson, oleg, (err , files) => {
//   if (err) {
//     console.log(err);
//     return;
//   }
// });

module.exports = {
  prepareData
}
