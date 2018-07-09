String.prototype.format = function () {
  let params = arguments;
  return this.replace(/{\d+}/g, function (match) {
    let index = Number(match.replace("{", "").replace("}", ""));
    return params[index] || "";
  })
}

function Node(point, parent, isLeaf) {
  // indicate if the Node is a leaf
  // if true, the value of node is definite, using `point` to calculate
  // if false, will record all s calculated by its 2 children depending on calculator that is <= 24 into (Map), hence using values of ``
  this.isLeaf = isLeaf;
  // the point of a poker card
  this.point = point;
  // key will be expression, value will be value of expression
  this.results = {};
  // to make the tree structure
  this.parent = parent;
  this.leftChild = null;
  this.rightChild = null;
  if (parent.isLeaf) {
    throw new Error("can't append children to leaf node");
  }
  if (parent.rightChild) {
    throw new Error("children more than 2");
  } else if (parent.leftChild) {
    parent.rightChild = this;
  } else {
    parent.leftChild = this;
  }
}

const clone = function (json) {
  return JSON.parse(JSON.stringify(json));
}


const shuffle = function (combination, cards, combinations) {
  for (let i = 0; i < cards.length; i++) {
    let combinationCopy = clone(combination);
    combinationCopy.push(cards[i]);
    let cardsCopy = clone(cards);
    cardsCopy.splice(i, 1);
    if (cardsCopy.length) {
      shuffle(combinationCopy, cardsCopy, combinations);
    } else {
      combinations.push(combinationCopy);
    }
  }
}

// test shuffle
// shuffle([], [1, 2, 3, 4]);

/**
 * there will only be 2 binary tree structures for 4 cards despite () will change the calculation priority
 * they are
 * 
 *            O
 *          /   \
 *         O     O
 *        / \   / \
 *       O   O O   O
 * 
 * 
 *             O
 *            / \
 *           O   O
 *          / \
 *         O   O
 *        / \
 *       O   O
 */

// implement the 2 structures above with card point not specified
// will make 24 copies for all the combinations for each of the structure

let scenario1, scenario2;
const implementScenario1 = function () {
  scenario1 = new Node(null, false, false);
  new Node(null, scenario1, false);
  new Node(null, scenario1, false);
  new Node(null, scenario1.leftChild, true);
  new Node(null, scenario1.leftChild, true);
  new Node(null, scenario1.rightChild, true);
  new Node(null, scenario1.rightChild, true);
}
const implementScenario2 = function () {
  scenario2 = new Node(null, false, false);
  new Node(null, scenario2, false);
  new Node(null, scenario2, true);
  new Node(null, scenario2.leftChild, false);
  new Node(null, scenario2.leftChild, true);
  new Node(null, scenario2.leftChild.leftChild, true);
  new Node(null, scenario2.leftChild.leftChild, true);
}
implementScenario1(), implementScenario2();

// test tree structure
// console.log(scenario1);
// console.log(scenario2);

// clear whole tree
const clearNode = (node) => {
  node.point = null;
  node.results = {};
  if (node.leftChild) {
    clearNode(node.leftChild);
  }
  if (node.rightChild) {
    clearNode(node.rightChild);
  }
}

// test clear node
// clearNode(scenario1);
// console.log();

const specifyNodePoint = (scenario, cards) => {
  if (scenario.isLeaf) {
    scenario.point = cards.splice(0, 1)[0];
  } else {
    specifyNodePoint(scenario.leftChild, cards);
    specifyNodePoint(scenario.rightChild, cards);
  }
}

// test specifyNodePoint
// specifyNodePoint(scenario1, [2, 2, 3, 3]);
// specifyNodePoint(scenario2, [2, 2, 3, 3]);

const calculateResult = (map, leftExp, leftVal, rightExp, rightVal) => {
  ["+", "-", "*", "/"].forEach(calculator => {
    const keyPattern = "({0}{1}{2})";
    let key = keyPattern.format(leftExp, calculator, rightExp);
    let value = null;
    switch (calculator) {
      case "+":
        value = leftVal + rightVal;
        break;
      case "-":
        value = leftVal - rightVal;
        break;
      case "*":
        value = leftVal * rightVal;
        break;
      case "/":
        if (rightVal !== 0 && leftVal % rightVal === 0) {
          value = left / right;
        }
        break;
    }
    if (value !== null && value <= 24) {
      map[key] = value;
    }
  })
}

const calculateScenario = (node) => {
  // judging by the tree structure, when left child is leaf, right child is definite leaf
  if (node.leftChild.isLeaf) {
    let leftExp = left = node.leftChild.point, rightExp = right = node.rightChild.point;
    calculateResult(node.results, leftExp, left, rightExp, right);
  } else {
    calculateScenario(node.leftChild);
    if (!node.rightChild.isLeaf) {
      calculateScenario(node.rightChild);
    }
    let leftResults = node.leftChild.results;
    for (let leftExp in leftResults) {
      let leftVal = leftResults[leftExp];
      if (node.rightChild.isLeaf) {
        let rightExp = rightVal = node.rightChild.point;
        calculateResult(node.results, leftExp, leftVal, rightExp, rightVal);
      } else {
        let rightResults = node.rightChild.results
        for (let rightExp in rightResults) {
          let rightVal = rightResults[rightExp];
          calculateResult(node.results, leftExp, leftVal, rightExp, rightVal);
        }
      }

    }
  }
}

// test calcualte
// calculateScenario(scenario1);
// calculateScenario(scenario2);

// check result
const getResult = ({ results }, solutions) => {
  for (let exp in results) {
    if (results[exp] === 24) {
      if (solutions.indexOf(exp) === -1) {
        console.log(exp);
        solutions.push(exp);
      }
    }
  }
}

const get24PointSolution = () => {
  // all 24 combinations of cards

  let cards = (document.querySelector("#cards").innerHTML || "").split('\t\t');
  let combinations = [];
  let solutions = [];

  shuffle([], cards, combinations);

  for (let i = 0; i < combinations.length; i++) {
    clearNode(scenario1);
    specifyNodePoint(scenario1, clone(combinations[i]));
    calculateScenario(scenario1);
    getResult(scenario1, solutions);
    clearNode(scenario2);
    specifyNodePoint(scenario2, clone(combinations[i]));
    calculateScenario(scenario2);
    getResult(scenario2, solutions);
  }

  console.log(solutions);
  document.querySelector("#solutions").innerHTML = solutions.join('<br>');
  return solutions;
}

const generateCards = () => {
  let cards = [];
  for (let i = 0; i < 4; i++) {
    cards.push(Math.ceil(Math.random() * 13));
  }
  document.querySelector("#cards").innerHTML = cards.join('\t\t');
  return cards;
}
