// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

NUM_CATEGORIES=6
NUM_QUESTIONS_PER_CAT=5;


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const url = `http://jservice.io//api/random?count=${NUM_CATEGORIES*3}`
    let results = await axios.get(url).catch((err)=>console.log(err));
    let totalIds=results.data.map((clue)=>clue.category_id)
    let ids=[]
    while(true){
        if(ids.length===NUM_CATEGORIES)break;
        let id = totalIds[Math.floor(Math.random()*(totalIds.length+1))];
        if(!ids.includes(id) && id){
            ids.push(id);
        }
    }
        return ids;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const url =`http://jservice.io//api/category?id=${catId}`
    let result = await axios.get(url).catch((err)=>console.log(err));
    let totalClues =[...result.data.clues]
    let {title, id} = result.data;
    let clues=[];
    let i =0;
    while(true){
        if(clues.length===NUM_QUESTIONS_PER_CAT)break;
        let clue = totalClues[Math.floor(Math.random()*(totalClues.length+1))];
        if(clue && clues.length===0 || clue && !clues.some((clue1)=> clue1.answer === clue.answer)){
            if(clue.question){
                clues.push({
                    clue:clue.question,
                    id:clue.id,
                    answer:clue.answer,
                    showing:null
            });
            i++;
            }
        }
    }
    return{id, title,clues};
}

async function getCategories(){
    const ids= await getCategoryIds();
    let cat =[];
    for(let i=0;i<NUM_CATEGORIES;i++){
        cat.push(await getCategory(ids[i]));
    }
    
    return cat;
}
/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable(categories) {
    

    //dom manipulation
    let $head = $('<tr>');
    let $thead = $('<thead>');
    let $body = $('<tbody>');
    $body.on('click', (e)=>handleClick(e,categories))
    const $table = $(`#jeopardy`);
    $thead.append($head).appendTo($table);

    
    $table.append($body);
    $('body').prepend($table);

    for(let i=0; i<NUM_CATEGORIES;i++){
        $head.append(`<th><p>${categories[i].title.toUpperCase()}</p></th>`)
    }
    for(let i=0; i<NUM_QUESTIONS_PER_CAT;i++){
        let $tr = $('<tr>');
        for(let j=0; j<NUM_CATEGORIES; j++){
            $tr.append(`<td><div class='question-container' data-question-id='${categories[j].clues[i].id}'><i class=" q far fa-question-circle fa-4x"></i></div></td>`);
        }
        $body.append($tr);
    }
    return categories;
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt, categories) {
    let target = evt.target;
    let card = (target.nodeName==='DIV') ? $(target): (target.nodeName==='I'|| target.nodeName==='P') ? $(target.parentElement):null;
    if(!card) return;
    let id =card.attr('data-question-id');
    // let clue =categories.reduce((acc, category)=>{
    //     let response =category.clues.filter((clue)=>{
    //         console.log(id ===clue.id.toString())
    //         clue.id.toString()===id});
    //     return (response[0]) ? response[0]:acc
    // })
    let clues = categories.map((cat)=>cat.clues).flat();
    let clue = clues.reduce((acc, clue)=>{
        return (clue.id.toString() ===id) ? clue:acc;
    })
    console.log(clue)
    if(clue.showing==='question'){
        card.html(`<p>${clue.answer}</p>`)
        clue.showing='answer';
    }
    if(clue.showing==='answer'){
        return;
    }
    if(!clue.showing){
        card.html(`<p>${clue.clue}</p>`)
        clue.showing='question';
    }
    
    

}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    let $board =$('#jeopardy').empty()
    $board.append('<div class="center"><i class="fas fa-circle-notch fa-spin fa-5x"></i></div>')


}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    let $board =$('#jeopardy').empty()

}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    $(`<table id='jeopardy'>`).appendTo('body');
    showLoadingView()
    let categories = await getCategories();
    hideLoadingView()
    fillTable(categories);
}

/** On click of start / restart button, set up game. */

$('#btn').on('click',function(){
    try{
        $('#jeopardy').remove();
    }
    catch{

    }
    setupAndStart();
    $(this).text('Restart Game');
})