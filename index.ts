namespace MontyHall{

    var cardHeightToWidthRatio = 1.618;
    var cardMaxWidth = 200;
    var cardMinWidth = 40;

    export function play(id: string, cards: number, onGameEnded?: (card: Card) => void){
        var bodyHeight = document.body.offsetHeight;
        var screenHeight = window.innerHeight;
        var screenWidth = screen.width;
        var outerBox = document.getElementById(id);
        outerBox.innerHTML = "";
        var width = outerBox.offsetWidth;
        
        var cardWidth = getCardWidth(outerBox.clientWidth, cards);
        var maxCards = Math.floor(outerBox.clientWidth / cardWidth) * Math.floor(screenHeight / (cardWidth * cardHeightToWidthRatio));

        if(cards > maxCards){
            // dont allow more than a screenful of cards
            cards = maxCards;
        }

        var restartButtonCreated = false;
        var game = new Game((e, card: Card) => {
            if(!restartButtonCreated){
                if(onGameEnded){
                    onGameEnded(card);
                }
                var restartButton = document.createElement("div");
                restartButton.className = "restart";
                restartButton.innerText = "Restart";
                restartButton.onclick = function(e){
                    play(id, cards, onGameEnded);
                }
                outerBox.appendChild(restartButton);
                restartButtonCreated = true;
            }
        });

        var cardBox = game.getCards(cardWidth, cards);
        outerBox.appendChild(cardBox);

        if(!document.getElementById("monty-hall-css")){
            var ss = document.createElement("link");
            ss.rel = "stylesheet";
            ss.type = "text/css";
            ss.href = "http://www.michalpaszkiewicz.co.uk/montyhallr/index.css";
            ss.id = "monty-hall-css";
            document.head.appendChild(ss);
        }
    }

    function getCardWidth(boxWidth: number, cards: number){
        return Math.max(cardMinWidth, Math.min(boxWidth / cards, cardMaxWidth));
    }

    class Card{
        isChosen: boolean = false;
        constructor(public element: HTMLElement, public isCorrect: boolean, onclick: (e) => void, public onfinish: (e, card: Card) => void){
            var self = this;
            self.element.onclick = function(e){ 
                self.choose();
                onclick(e);
                self.allowFinish();
            }
        }
        choose(){
            this.isChosen = true;
            this.element.firstElementChild.className += " chosen"
        }
        flip(inTime: number){
            var self = this;
            window.setTimeout(function(){
                self.element.firstElementChild.className += " flipped";
                self.element.onclick = null;
            }, inTime);
        }
        allowFinish(){
            var self = this;
            self.element.onclick = function(e){
                self.flip(0);
                self.onfinish(e, self);
            };
        }
    }

    class Game{
        
        cards: Card[] = [];
        chosenCard: Card;
        switchCard: Card;

        constructor(public onfinish: (e, card:Card) => void){

        }

        getCards(width: number, cards: number){
            var self = this;
            var rand = Math.floor(Math.random() * cards)
            // *****************
            // remove this
            console.log(rand);
            // *****************        
            var cardBox = document.createElement("div");
            for(var i = 0; i < cards; i++){
                var isRand = rand == i;
                var card = getCard(width, isRand);
                var cardObject = new Card(card, isRand, (e) => {
                    self.turnUnchosenButOne();
                }, (e, card: Card) => {
                    self.onfinish(e, card);
                });
                this.cards.push(cardObject);                
                cardBox.appendChild(card);
            }
            var clearer = document.createElement("div");
            clearer.className = "clear";
            cardBox.appendChild(clearer);
            return cardBox;
        }

        chosenCardIsCorrect(){
            return this.cards.some((card: Card)=>card.isChosen && card.isCorrect);
        }

        turnUnchosenButOne(){
            var chosenCard = this.cards.filter((card) => card.isChosen)[0];
            var otherCard = this.cards.filter((card) => card.isCorrect)[0];
            var unchosenCards = this.cards.filter((card) => !card.isChosen);
            var time = 0;
            if(this.chosenCardIsCorrect()){
                var rand = Math.floor(Math.random() * unchosenCards.length);
                for(var i = 0; i < unchosenCards.length; i++){
                    if(i != rand){
                        unchosenCards[i].flip(time+=2);
                    }
                }
                otherCard = unchosenCards[rand];
            }
            else{             
                unchosenCards.forEach(card => {
                    if(!card.isCorrect){            
                        card.flip(time+=2);
                    }
                });
            }
            this.chosenCard = chosenCard;
            this.switchCard = otherCard;
            this.switchCard.allowFinish();
        }
    }

    function getCard(width: number, isCorrectCard?: boolean){
        var cardContainer = document.createElement("div");
        cardContainer.className = "card-container";
        cardContainer.style.width = (width) + "px";
        cardContainer.style.height = (width * cardHeightToWidthRatio) + "px";
        var card = document.createElement("div");
        card.className = "card";
        card.style.perspective = (width * 2) + "px";
        var flipper = document.createElement("div");
        flipper.className = "flipper";
        var front = document.createElement("div");
        front.className = "front";
        var back = document.createElement("div");
        back.className = "back";
        if(isCorrectCard){
            back.appendChild(getCorrectDesign());
        }
        else{
            back.appendChild(getWrongDesign());
        }
        front.appendChild(getFrontDesign());
        flipper.appendChild(front);
        flipper.appendChild(back);
        card.appendChild(flipper);
        cardContainer.appendChild(card);
        return cardContainer;
    }

    function getCorrectDesign(){
        var correctDesign = document.createElement("div");
        correctDesign.className = "correct";
        var corners = ["tl","tr","bl","br"];
        for(var i = 0; i < 4; i++){
            var corner = document.createElement("div");
            corner.className = "correct-corner " + corners[i];
            correctDesign.appendChild(corner);
        }
        return correctDesign;
    }

    function getWrongDesign(){
        var wrongDesign = document.createElement("div");
        var colors = ["red","green","blue"];
        var randColor = colors[Math.floor(Math.random() * colors.length)];
        wrongDesign.className = "wrong " + randColor;
        var corners = ["tl","tr","bl","br"];
        for(var i = 0; i < 4; i++){
            var corner = document.createElement("div");
            corner.className = "wrong-corner " + corners[i] + " " + randColor;
            wrongDesign.appendChild(corner);
        }
        return wrongDesign;
    }

    function getFrontDesign(){
        var frontDesign = document.createElement("div");
        frontDesign.className = "pattern";
        return frontDesign;
    }

}