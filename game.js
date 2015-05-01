var CARD_COUNT=13;
var TYPE_COUNT=4;
var TYPE_LIST;
var CARDS;
var CardId=0;
var CARD_RED = "RED";
var CARD_BLACK = "BLACK";
var RAWS;
var RT_IN = 0;
var RT_OUT = 1;
var CARD_WIDTH=71;
var CARD_HEIGHT=96;
var RAW_SPACE=10;
var RAW_HAND;
var RAW_OPEN;
var RAW_HAND_INDEX = 18;
var RAW_OPEN_INDEX = 19;
var CARD_INDEX_MAX = 13;
var CARD_INDEX_MIN = 1;
var undoCard = false;
var undoOld = false;
var undoRaw = false;
var gameCards = null;

var cardClick = function()
{
	var card;
	card = RAW_HAND.cardList.pop();
	RAW_OPEN.addCard(card);
	undoCard = card;
	undoOld = RAW_HAND;
	undoRaw = RAW_OPEN;
	updateCounts();
}
var cardDoubleClick = function()
{
	var id;
	var index;
	var card;                                                 
	var tmp;
	var last;
	
	id = $(this).attr("id");
	index = getCardIndex(id);
	
	card = CARDS[index];
	if(card.rawIndex > 10 && card.rawIndex<18)
	{
		//alert("raw:"+card.rawIndex);
		return;
	}
	old = RAWS[card.rawIndex];
	tmp = old.getCardList(card);
	
	if(tmp.length != 1)
	{
		//alert("len:"+tmp.length);
		return;
	}
	for(var i=10;i<18;i++)
	{
		if(card.index == 1)
		{
			if(RAWS[i].cardList.length == 0)
			{
				moveCards(card, old, RAWS[i]);
				return;
			}
		}
		else
		{
			last = RAWS[i].getLastCard();
			if(last == false)
			{
				continue;
			}
			if(last.type == card.type)
			{
				if((last.index+1) == card.index)
				{
					moveCards(card, old, RAWS[i]);
					return;
				}
			}
		}
	}
}
function updateCounts()
{
	$("div#open").html(RAW_OPEN.cardList.length);
	$("div#close").html(RAW_HAND.cardList.length);
}
function moveCards(card, old, raw)
{
	var list;
	
	list = old.getCardList(card);
	
	for(var i=1;i<list.length;i++)
	{
		if(list[i].color == list[i-1].color)
		{
			card.restore();
			return;
		}
		else if(list[i].index != (list[i-1].index-1))
		{
			card.restore();
			return;		
		}
	}
	raw.addCardList(list);
	old.removeCardList(card);
	undoCard = card;
	undoOld = old;
	undoRaw = raw;
	updateCounts();
}
var dragStart = function(event, ui)
{
	var id;
	var index;
	var card;
	
	id = $(this).attr("id");
	index = getCardIndex(id);
	
	card = CARDS[index];
	$(card.getSelector()).css("z-index", 100);
}
var dragStop = function(event, ui)
{
	var id;
	var index;
	var len;
	var card;
	var raw;
	var last;
	var old;
	
	id = $(this).attr("id");
	index = getCardIndex(id);
	
	card = CARDS[index];
	debug(card.rawIndex);
	old = RAWS[card.rawIndex];
	
	raw = findRaw(ui.position.left, ui.position.top);
	if(raw == false)
	{
		card.restore();
		return;
	}
	if(raw == old)
	{
		card.restore();
		return;
	}
	debug("old:" + old.index+ " raw:"+raw.index);
	last = raw.getLastCard();
	if(raw.type == RT_OUT)
	{
		if(last == false)
		{
			if(card.index != CARD_INDEX_MIN)
				card.restore();
			else
				moveCards(card, old, raw);
		}
		else
		{
			if(card.type != last.type)
				card.restore();
			else if(card.index != (last.index + 1))
				card.restore();
			else
				moveCards(card,old, raw);
		}
	}
	else
	{
		if(last != false)
		{
			if(last.index != (card.index+1))
				card.restore();
			else if(card.color == last.color)
				card.restore();
			else
			{
				moveCards(card, old, raw);
			}				
		}
		else
		{
			if(card.index == CARD_INDEX_MAX)
				moveCards(card, old, raw);
			else
				card.restore();
		}
	}
	return;	
}
function findRaw(left, top)
{

	for(var i=0;i<RAWS.length;i++)
	{
		if(RAWS[i].isInside(left, top)==true)
			return RAWS[i];
	}

	return false;
}
function getCardIndex(str)
{
	var tmp;
	tmp = str.split("d");	
	return parseInt(tmp[1]);
}
function Card(Type, Index)
{
	var type;
	var index;
	var color;
	var ID;
	var name = "";
	var inList = false;
	var left = 0;
	var top = 0;
	var opened = false;
	var rawIndex = -1;
	var zindex = 0;
	
	ID = CardId;
	CardId++;
	type = Type;
	index = Index;

	switch(index)
	{
		/*
		case 1:
			name = "a";
			break;
		case 10:
			name = "t";
		*/case 11:
			name = "j";
		break;
		case 12:
			name = "q";
		break;
		case 13:
			name = "k";
		break;
		default:
			name = "" + index;
	}
	
	if(type=="diamonds" || type=="hearts")
		color = CARD_RED;
	else
		color = CARD_BLACK;
	//debug("CARD:" + ID + " " + name + " " + type + " " + index + " " + color);
	$("#main").append("<div class=\"card ui-corner-all\" id=card"+ID+"></div>");
	$("#card"+ID).html(ID);
	
	$("#card"+ID).css("top", 300); 
	$("#card"+ID).css("left",10); 
	var remove = function()
	{
		this.inList = false;
	}
	var add = function()
	{
		this.inList = true;
	}
	var check = function()
	{
		return this.inList;
	}
	var open = function()
	{
		//var str = "<img width=18 height=22 src=img/"+this.type+".bmp> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font size=6 color="+this.color+">"+this.name+"</font>"
		//var str = "<img width=80 height=110 src=img/cards-150/"+this.type+"-"+this.name+"-150.png>"
		//var str = "<img width=80 height=110 src=img/cards-20/"+this.name+this.type.charAt(0)+".GIF>"
		var str = "<img src=img/cards-gif/"+this.type.charAt(0)+this.name+".GIF>";
		var hcolor;
		
		if(this.opened == true)
			return;
		if(this.color == CARD_RED)
			hcolor = "#ffffff";
		else
			hcolor = "#f0f0f0"
		$(this.getSelector()).css("background-color", hcolor);
		$(this.getSelector()).html(str);
		$(this.getSelector()).unbind('click', cardClick);
		$(this.getSelector()).bind('dblclick', cardDoubleClick);
		this.opened = true;
		$(this.getSelector()).draggable();
		$(this.getSelector()).draggable({stop: dragStop});
		$(this.getSelector()).draggable({start: dragStart});
	}
	var close = function()
	{
		$(this.getSelector()).html("<img src=img/cards-gif/b1fv.GIF>");
		//$(this.getSelector()).css("background-color", "#777777");
		//$("#card"+this.ID).bind('dblclick', cardClick);
		this.opened = false;
		$(this.getSelector()).click(cardClick);
	}
	var ZIndex = function(Index)
	{
		this.zindex = Index;
		$(this.getSelector()).css("z-index", Index);
	}
	var restore = function()
	{
		this.move(this.left, this.top);
		$(this.getSelector()).css("z-index", this.zindex);
	}
	var move = function(Left, Top)
	{
		var obj;
		
		this.left = Left;
		this.top = Top;
		$(this.getSelector()).css("left", this.left+"px");
		$(this.getSelector()).css("top", this.top+"px");
		//debug(this.ID+":move to " + this.left + ":"+this.top);
	}
	
	var getSelector = function()
	{
		return "#card"+this.ID;
	}
	return { name:name, type:type, index:index, color:color, ID:ID, add:add, 
				remove:remove, check:check, open:open, close:close,
				move:move, ZIndex:ZIndex, opened:opened, getSelector:getSelector,
				rawIndex:rawIndex, restore:restore, zindex:zindex
				};
}

function Raw(Type, Index, Left, Top)
{
	var index;
	var type;
	var cardList;
	var top = 0;
	var left = 0;
	
	index = Index;
	type = Type;
	cardList = new Array();
	left = Left;
	top = Top;
	
	if(type == RT_OUT)
	{
		$("#main").append("<div id=raw"+index+" class=raw></div>");
		$("#raw"+index).css("left", left-5);
		$("#raw"+index).css("top", top-5);
	}
	//debug("raw:" + index + " type:"+type);
	var addCard = function(card)
	{
		var xleft;
		var xtop;
		
		if(this.type == RT_OUT)
		{
			xleft = this.left;
			xtop = this.top;
		}
		else
		{
			xleft = this.left;
			xtop = this.top + this.cardList.length*CARD_HEIGHT/3;
		}
		
		
		if(this.index == RAW_HAND_INDEX)
			card.close();
		else
			card.open();
		
		
		card.move(xleft, xtop);
		card.ZIndex(this.cardList.length+1);
		this.cardList.push(card);
		card.rawIndex = this.index;
	}

	var addCardList = function(cards)
	{
		var i;
		for(i=0;i<cards.length;i++)
			this.addCard(cards[i]);
	}
	var getLastCard = function()
	{
		var len;
		len = this.cardList.length;
		if(len > 0)
			return this.cardList[len -1];
		else
			return false;
	}
	var removeCardList = function(card)
	{
		var i;
		var len;
		
		len = this.cardList.length;
		for(i=0;i<len;i++)
		{
			if(this.cardList[i] == card)
			{
				this.cardList.splice(i, len-i);
				break;
			}
		}		
	}
	var getCardList = function(card)
	{
		var i;
		var len;
		var ret;
		var found = -1;
		
		len = this.cardList.length;
		ret = new Array();
		
		for(i=0;i<len;i++)
		{
			if(this.cardList[i] == card)
				found = i;
			if(found>=0)
				ret.push(this.cardList[i]);
		}		
		return ret;
	}
	var isInside = function(left, top)
	{
		var xleft;
		var xtop;
		
		if(this.type == RT_OUT)
		{
			xleft = this.left;
			xtop = this.top;
		}
		else
		{
			xleft = this.left;
			xtop = this.top + (CARD_HEIGHT/3)*(this.cardList.length);
		}
		
		
		if((left > xleft-(RAW_SPACE +10)) && (left < (xleft + CARD_WIDTH)))
		{
			if((top > xtop-CARD_HEIGHT) && (top < (xtop + CARD_HEIGHT)))
			{
				return true;
			}
		}
		return false;
	}
	var empty = function()
	{
		this.cardList.splice(0,this.cardList.length);
	}
	return {index:index, cardList:cardList, addCard:addCard, empty:empty,
			left:left, top:top, type:type,
			getCardList:getCardList, addCardList:addCardList, getLastCard:getLastCard,
			removeCardList:removeCardList, isInside:isInside
			};
}

function debug(s)
{
	var str;
	
	str = $("#debug").val();
	str += s + "\r\n";
	$("#debug").val(str);
}

function initCards()
{
	CARDS = new Array();
	TYPE_LIST = new Array();
	TYPE_LIST.push("diamonds");
	TYPE_LIST.push("clubs");
	TYPE_LIST.push("hearts");
	TYPE_LIST.push("spades");

	for(var i=0;i<TYPE_LIST.length;i++)
	{
		for(var j=1; j<= CARD_COUNT; j++)
		{
			CARDS.push(new Card(TYPE_LIST[i], j));
			CARDS.push(new Card(TYPE_LIST[i], j));
		}
	}
}

function initRaws()
{
	var type;
	var left = 0;
	var top = 0;
	
	RAWS = new Array();
	
	for(var i=0;i<18;i++)
	{
		if(i < 10)
		{
			type = RT_IN;
			top = 10;
			left = 10+i*(CARD_WIDTH+RAW_SPACE);
		}
		else
		{
			type = RT_OUT;
			if(i%2)
			{
				left = 880;
				top = 10+(i-11)*(CARD_HEIGHT/2 + 20);
			}
			else
			{
				left = 1000;
				top = 10+(i-10)*(CARD_HEIGHT/2 + 20);
			}
			
		}	
		RAWS.push(new Raw(type, i, left, top));
	}
	RAW_OPEN = new Raw(RT_OUT, RAW_OPEN_INDEX, 1000, 580);
	RAW_HAND = new Raw(RT_OUT, RAW_HAND_INDEX, 880, 580);
	$("#raw"+RAW_OPEN_INDEX).css("background-color", "white");
	$("#raw"+RAW_HAND_INDEX).css("background-color", "white");
	RAWS.push(RAW_HAND);
	RAWS.push(RAW_OPEN);
}

function getFreeCard()
{
  var ret;
  var i;
  
  if(gameCards != null)
    return gameCards.pop();
  
  
  
  while(1)
  {
	ret = (Math.floor(Math.random()*100000)) % 104;

	if(CARDS[ret].check() == false)
        	break;
      //ret = (ret +1)%104;
  }
  
  return ret;
}
function prepareCards()
{
	var i;
	var j;
	var len;
	var index;
	var count = 0;
  var clist = null;
  
  clist = new Array();
	
	len = CARDS.length;
	for(i=0;i<len;i++)
		CARDS[i].remove();
	
	len = RAWS.length;
	for(i=0;i<len;i++)
		RAWS[i].empty();
	
	RAW_HAND.empty();
	
	for( i = 0; i < 10; i++)
	{
		for(j = i; j < 10; )
		{	
			index = getFreeCard();
      clist.push(index);
			RAWS[j].addCard(CARDS[index]);
			CARDS[index].add();
			j++;
		}
	}
	for(i=0;i<49;)
	{
		index = getFreeCard();
    clist.push(index);
		RAW_HAND.addCard(CARDS[index]);
		CARDS[index].add();
		i++;
	}
	updateCounts();
  gameCards = clist;
}

function restartGame()
{
  var i;
  
  for(i=0;i<RAWS.length;i++)
    RAWS[i].empty();
  
  for(i=0;i<CARDS.length;i++)
  {
    CARDS[i].close();
    CARDS[i].remove();
    $("#card"+i).unbind('click');
    $("#card"+i).unbind('dblclick');
  }
  gameCards.reverse();
  prepareCards();
}
function newGame()
{
	initCards();
	initRaws();
	prepareCards();
	debug("newGame");
}

function initGame()
{
	//$(".card").draggable();
	$("#undo").click(function(){
		if(undoCard == false)
			return;
		moveCards(undoCard, undoRaw, undoOld);
		undoCard = false;
	});

	$("#newGame").click(function(){
		window.location.reload();
	});
	$("#restartGame").click(function(){
		restartGame();
	});

	$("#buttons").css("left", 10);
	$("#buttons").css("top", 600);

	$("#close").css("left", 880);
	$("#close").css("top", 550);

	$("#open").css("left", 1000);
	$("#open").css("top", 550);

}
