var i_x,i_y,i_rotate,b_square,b_ellipse,b_translate,b_rotate,b_rotateanti,b_reset,b_refx,b_refy,b_refyx,b_refxy,b_refo;
var sliderx,slidery,slidersx,slidersy;
var bkcol='#b3d9ff',canvascol='#d2e4f7',shapecol='#4794e0';
var xoffset=0,yoffset=80,canvaswidth,canvasheight=700,xprange,xnrange;
var dim,wid,hgt,drawr,drawe,shape,shapetype;
var pos,msgflag,msg=[];
var motionx,motiony,motiondeg;
var ddastep,ddalength,transflag,rotateflag,rotatedir,step1,rflag1,rflag2,rflag3,rotated,rotatedlater,shearx,sheary;
var init,init1,init2;
var yxflag,xyflag;

msg[0]='';
msg[1]='*INVALID INPUT'
msg[2]='*OUT OF BOUNDS';
msg[3]='*NO SHAPE DRAWN';

function setup(){
	var mycv=createCanvas(window.innerWidth,900);
	mycv.parent('sketch-holder');

  canvaswidth=Math.trunc((window.innerWidth/50))*50;
  console.log('CANVAS WIDTH: '+canvaswidth);
  xprange=Math.ceil(canvaswidth/100);
  xnrange=xprange*-1;
  console.log('X+ : '+xprange);
  console.log('X- : '+xnrange);

  b_square=createButton('DRAW RECTANGLE');
  b_square.position(20, yoffset+canvasheight+100);
  b_square.mousePressed(f_drawr);

  b_ellipse=createButton('DRAW ELLIPSE');
  b_ellipse.position(b_square.x,b_square.y+b_square.height+10);
  b_ellipse.mousePressed(f_drawe);

  b_reset=createButton('CLEAR');
  b_reset.position(b_ellipse.x,b_ellipse.y+b_ellipse.height+10);
  b_reset.mousePressed(reset);

  i_x = createInput();
  i_x.position(b_square.x+b_square.width+25,b_square.y);

  i_y = createInput();
  i_y.position(i_x.x+i_x.width, b_square.y);

  b_translate = createButton('TRANSLATE');
  b_translate.position(i_y.x + i_y.width, b_square.y);
  b_translate.mousePressed(f_translate);

  i_rotate = createInput();
  i_rotate.position(i_x.x, i_y.y+i_y.height+10);

  b_rotate=createButton('ROTATE CLOCKWISE');
  b_rotate.position(i_rotate.x+i_rotate.width,i_rotate.y);
  b_rotate.mousePressed(f_rotateclk);

  b_rotateanti=createButton('ROTATE COUNTER-CLOCKWISE');
  b_rotateanti.position(b_rotate.x+b_rotate.width,i_rotate.y);
  b_rotateanti.mousePressed(f_rotateanti);

  sliderx=createSlider(xnrange,xprange,1);
  sliderx.position(b_rotateanti.x+b_rotateanti.width+50,b_square.y);

  slidery=createSlider(-7,7,1);
  slidery.position(b_rotateanti.x+b_rotateanti.width+50,b_rotateanti.y);

  slidersx=createSlider(-90,90,0);
  slidersx.position(sliderx.x+sliderx.width+100,sliderx.y);

  slidersy=createSlider(-90,90,0);
  slidersy.position(slidery.x+slidery.width+100,slidery.y);

  b_refo=createButton('REFLECTION IN ORIGIN');
  b_refx=createButton('REFLECTION IN X-AXIS');
  b_refy=createButton('REFLECTION IN Y-AXIS');
  b_refyx=createButton('REFLECTION IN LINE Y=X');
  b_refxy=createButton('REFLECTION IN LINE Y=-X');

  b_refo.position(i_rotate.x,i_rotate.y+i_rotate.height+10);
  b_refx.position(b_refo.x+b_refo.width,b_refo.y);
  b_refy.position(b_refx.x+b_refx.width,b_refx.y);
  b_refxy.position(b_refy.x+b_refy.width,b_refx.y);
  b_refyx.position(b_refxy.x+b_refxy.width,b_refx.y);

  b_refo.mousePressed(f_refo);
  b_refx.mousePressed(f_refx);
  b_refy.mousePressed(f_refy);
  b_refxy.mousePressed(f_refxy);
  b_refyx.mousePressed(f_refyx);

  rectMode(CENTER);
  angleMode(DEGREES);

  reset();
}

function draw(){
	background(bkcol);
  frameRate(100);
  noStroke();

  fill(0);
  textSize(35);
  textStyle(BOLD);
  textAlign(CENTER,CENTER);
  text('TRANSFORMATIONS',window.innerWidth/2,37);
  
  //canvas
  fill(canvascol);
  rect((canvaswidth+20)/2,yoffset+canvasheight/2,canvaswidth+20,canvasheight,10);
  
  //grid
  drawgrid();
  
  //co-ordinates
  if(inside_bounds(mouseX,mouseY)){
    text(parseFloat(Math.trunc(mouseX)/50-xprange).toFixed(2)+' , '+parseFloat((canvasheight/2-Math.trunc(mouseY)+yoffset)/50).toFixed(2),mouseX+15,mouseY+5);
    //text(mouseX+' , '+mouseY,mouseX+10,mouseY+5)
  }

  //reflection
  if(yxflag){
    canvastomouse(7,7);
    var a=pos[0],b=pos[1];
    canvastomouse(-7,-7);
    var c=pos[0],d=pos[1];
    line(a,b,c,d);
  }
  if(xyflag){
    canvastomouse(-7,7);
    var a=pos[0],b=pos[1];
    canvastomouse(7,-7);
    var c=pos[0],d=pos[1];
    line(a,b,c,d);
  }

  //draw shape
  if(mouseIsPressed&&(drawr||drawe)&&inside_bounds(mouseX,mouseY)){
    noFill();
    stroke('#4794e0');
    strokeWeight(4);
    
    wid=Math.abs(mouseX-dim[0])*2;
    hgt=Math.abs(mouseY-dim[1])*2;
    if(drawr){
      rect(dim[0],dim[1],wid,hgt);
    }
    else if(drawe){
      ellipse(dim[0],dim[1],wid,hgt);
    }
  }

  //fixate the shape
  if(shape){
    var x=sliderx.value();
    var y=slidery.value();
    
    var sx=slidersx.value();
    var sy=slidersy.value();
    
    var scalex,scaley;

    if(x>0&&y>0){
      scalex=wid*x;
      scaley=hgt*y;
    }
    else if(x>0&&y<0){
      scalex=wid*x;
      scaley=hgt/Math.abs(y);
    }
    else if(x<0&&y>0){
      scalex=wid/Math.abs(x);
      scaley=hgt*y;
    }
    else if(x<0&&y<0){
      scalex=wid/Math.abs(x);
      scaley=hgt/Math.abs(y);
    }

    noFill();
    stroke('#4794e0');
    strokeWeight(4);

    //shear
    if(sx==0&&sy==0){
      enablebuttons();
    }
    else{  
      disablebuttons();
      push();
      translate(dim[0],dim[1]);
      shearX(sx);
      shearY(sy);
      if(rotated)
        rotate(motiondeg*rotatedir);
      if(shapetype==0)
        rect(0,0,scalex,scaley);
      else if(shapetype==1)
        ellipse(0,0,scalex,scaley);
      pop();
    }
    //rotate
    if(rotateflag){
      disablebuttons();
      step = (init % ddalength);
      init++;
      if(rflag1&&init<ddalength){
        traverse(step,scalex,scaley); 
      }
      else if((init==ddalength||rflag2)&&!rflag3){
        init=0;
        rflag1=false;
        rflag2=true;
        step=init1%motiondeg+1;
        init1++;
        if(init1>motiondeg){
          init1=0;
          rflag2=false;
          rflag3=true;
          traverseback();
        }
        else{
          rotateas(step,scalex,scaley);
        }
      }
      else if(rflag3){
        step=init2%ddalength;
        init2++;
        if(init2==ddalength){
          init2=0;
          rflag3=false;
          rotateflag=false;
          enablebuttons();
        }
        else{
          rotatedlater=true;
          traverse(init2,scalex,scaley);
        }
      }
    }
    //shear
    else if(shearx||sheary){

    }

    //translate
    else if(transflag){
      disablebuttons();
      step = (init % ddalength);
      init++;
      if(init==ddalength){
        init=0;
        enablebuttons();
        transflag=false;
        dim[0]=dim[2];
        dim[1]=dim[3];
      }
      traverse(step,scalex,scaley);
    }
    //scalling:-
    else if(shapetype==0){//rect
      if(rotated)
        tilted(dim[0],dim[1],scalex,scaley,0);
      else
        rect(dim[0],dim[1],scalex,scaley);
      ellipse(dim[0],dim[1],4,4);
    }
    else if(shapetype==1){//ellipse
      if(rotated)
        tilted(dim[0],dim[1],scalex,scaley,1);
      else
        ellipse(dim[0],dim[1],scalex,scaley);
      ellipse(dim[0],dim[1],4,4);
    }
    fill(0);
    strokeWeight(1); 
    text('SCALE X: '+sliderx.value(),sliderx.x+sliderx.width+10,790);
    text('SCALE Y: '+slidery.value(),slidery.x+slidery.width+10,830);

    text('SHEAR X: '+slidersx.value(),slidersx.x+sliderx.width+10,790);
    text('SHAER Y: '+slidersy.value(),slidersy.x+slidery.width+10,830);
  }

  strokeWeight(1);

  noStroke();
  fill(12,23,45);
  textSize(20);
  text(msg[msgflag],b_refyx.x+b_refyx.width+20,865);
}

function f_translate(){
  cursor(ARROW);
  drawr=false;
  drawe=false;
  motionx=i_x.value();
  motiony=i_y.value();
  i_x.value('');
  i_y.value('');
  yxflag=false;
  xyflag=false;
  if(!shape){
    msgflag=3;//no shape drawn
  }
  else if(isFinite(motionx)&&motionx!=''&&isFinite(motiony)&&motiony!=''){
      init=0;
      msgflag=0;
      transflag=true;

      if(shapetype==1)//ellipse
        mousetocanvas(dim[0],dim[1]);
      else if(shapetype==0)//rectangle
        mousetocanvas(dim[0],dim[1]);

      var t1=parseFloat(pos[0])+parseFloat(motionx);
      var t2=parseFloat(pos[1])+parseFloat(motiony);
      
      canvastomouse(t1,t2);
        if(inside_bounds(pos[0],pos[1])&&inside_bounds(pos[0],pos[1]+hgt/2)&&inside_bounds(pos[0],pos[1]-hgt/2)){
          dda(dim[0],dim[1],pos[0],pos[1]);
          dim[2]=pos[0];
          dim[3]=pos[1];
        }
        else{
          msgflag=2;// out of bounds
          dim[2]=dim[0];
          dim[3]=dim[1];
          transflag=false;
        }      
  }
  else{ //invaid input
    msgflag=1;
  }
}

function dda(x1,y1,x2,y2){
  var x=x1,y=y1,i;
  
  var dx=Math.abs(x2-x1);
  var dy=Math.abs(y2-y1);

  var s1=sign(x2,x1);
  var s2=sign(y2,y1);
  var interchange=0;

  if(dy>dx){
    var temp=dy;
    dy=dx;
    dx=temp;
    interchange=1;
  }
  else
    interchange=0;

  var e=2*dy-dx;

  for(i=0;i<=dx;i++){
    ddastep[i][0]=x;
    ddastep[i][1]=y;

    while(e>0){
      if(interchange==1)
        x+=s1;
      else
        y+=s2;
      e=e-2*dx;
    }

    if(interchange==1)
      y+=s2;
    else
      x+=s1;
    e+=2*dy;
  }

  ddalength=i;
  console.log('ddalength: '+ddalength);
  // for(var i=0;i<ddalength;i++){
  //   console.log(ddastep[i][0]+' , '+ddastep[i][1]);
  // }
}

function sign(a,b){
  if(a-b==0)
    return 0;
  else if(a-b>0)
    return 1;
  else
    return -1;
}

function traverse(fr,scalex,scaley){
  ellipse(dim[0],dim[1],4,4);//initial point
  ellipse(pos[0],pos[1],4,4);//final point
  ellipse(ddastep[step][0],ddastep[step][1],4,4);//traversing point
  if(shapetype==0){
    if(rotatedlater)
      tilted(ddastep[step][0],ddastep[step][1],scalex,scaley,0);
    else
      rect(ddastep[step][0],ddastep[step][1],scalex,scaley);
  }
  else if(shapetype==1){
    if(rotatedlater)
      tilted(ddastep[step][0],ddastep[step][1],scalex,scaley,1);
    else
      ellipse(ddastep[step][0],ddastep[step][1],scalex,scaley);
  }
}

function tilted(a,b,w,h,t){
  push();
  translate(a,b);
  rotate(motiondeg*rotatedir);
  if(t==0)
    rect(0,0,w,h);
  else if(t==1)
    ellipse(0,0,w,h);
  //translate(- a,-b);
  pop();
}

function traverseback(){
  dda(pos[0],pos[1],dim[0],dim[1]);
}

function f_rotate(){
  cursor(ARROW);
  drawr=false;
  drawe=false;
  var tem=i_rotate.value().replace(/\s+/g,"");
  motiondeg=parseInt(tem);
  i_rotate.value('');

  if(!shape){
    msgflag=3;
  }
  else if(isFinite(motiondeg)&&motiondeg!=''&&motiondeg>=0&&motiondeg<=360){
    msgflag=0;
    init=0;
    console.log('Degrees: '+motiondeg);
    canvastomouse(0,0);
    dda(dim[0],dim[1],pos[0],pos[1]);
    dim[2]=pos[0];
    dim[3]=pos[1];
    rotateflag=true;
    rotated=true;
    rotatedlater=false;
    rflag1=true;
  }
  else{
    msgflag=1;//invalid input
  }
}

function f_rotateclk(){
  yxflag=false;
  xyflag=false;
  rotatedir=1;//clockwise
  f_rotate();
}
function f_rotateanti(){
  yxflag=false;
  xyflag=false;
  rotatedir=-1;//anti-clock
  f_rotate();
}

function rotateas(deg,w,h){
  push();
  translate(pos[0],pos[1]); 
  rotate(deg*rotatedir);
  if(shapetype==0)//rect
    rect(0,0,w,h);
  else if(shapetype==1)//ellipse
    ellipse(0,0,w,h);
  translate(-pos[0],-pos[1]); 
  pop();
}

function f_refx(){ 
  msgflag=0;
  if(shape){ 
    yxflag=false;
    xyflag=false;
    mousetocanvas(dim[0],dim[1]);
    var x=pos[0];
    var y=-pos[1];
    canvastomouse(x,y);
    dim[0]=pos[0];
    dim[1]=pos[1];
  }
  else
    msgflag=3;//no shape
}

function f_refy(){ 
  msgflag=0; 
  if(shape){ 
    yxflag=false;
    xyflag=false;
    mousetocanvas(dim[0],dim[1]);
    var x=-pos[0];
    var y=pos[1];
    canvastomouse(x,y);
    dim[0]=pos[0];
    dim[1]=pos[1];
  }
  else
    msgflag=3;//no shape
}

function f_refo(){ 
  msgflag=0; 
  if(shape){ 
    yxflag=false;
    xyflag=false;
    mousetocanvas(dim[0],dim[1]);
    var x=-pos[0];
    var y=-pos[1];
    canvastomouse(x,y);
    if(inside_bounds(pos[0],pos[1])){
      dim[0]=pos[0];
      dim[1]=pos[1];
    }
    else{
      msgflag=2;//out of bounds
    }
  }
  else
    msgflag=3;//no shape
}

function f_refyx(){ 
  msgflag=0; 
  if(shape){ 
    mousetocanvas(dim[0],dim[1]);
    var x=pos[1];
    var y=pos[0];
    canvastomouse(x,y);
    if(inside_bounds(pos[0],pos[1])){
      dim[0]=pos[0];
      dim[1]=pos[1];
      yxflag=true;
      xyflag=false;
    }
    else{
      msgflag=2;//out of bounds
    }
  }
  else
    msgflag=3;//no shape
}

function f_refxy(){  
  msgflag=0;
  if(shape){ 
    mousetocanvas(dim[0],dim[1]);
    var x=-pos[1];
    var y=-pos[0];
    canvastomouse(x,y);
    if(inside_bounds(pos[0],pos[1])){
      dim[0]=pos[0];
      dim[1]=pos[1];
      xyflag=true;
      yxflag=false;
    }
    else{
      msgflag=2;//out of bounds
    }
  }
  else
    msgflag=3;//no shape
}

function drawgrid(){
  fill(120);
  var x=xnrange;
  var y=6;
  var i,j;
  //verticallines
  textSize(10);
  textAlign(LEFT,TOP);
  for(i=0,j=0;x+j<=xprange;i=i+50,j++){  
    if(x+j==0)
      stroke(4);
    else
      stroke(180);
    line(i,yoffset,i,yoffset+canvasheight);
    text(x+j,i+3,canvasheight/2+yoffset+3);
  }
  //horizontallines
  text('7',canvaswidth/2+3.5,yoffset);
  text('-7',canvaswidth/2+3.5,yoffset+canvasheight-13);
  for(i=yoffset+50,j=0;i<canvasheight+yoffset;i=i+50,j--){
    if(y+j==0)
      stroke(4);
    else
      stroke(180);
    line(0,i,canvaswidth+50,i);
    text(y+j,canvaswidth/2+3.5,i+3);
  }
}

function mousePressed(){
  if(inside_bounds(mouseX,mouseY)&&(drawr||drawe)){
    dim[0]=mouseX;
    dim[1]=mouseY;
    dim[2]=mouseX;
    dim[3]=mouseY;
    wid=0;
    hgt=0;
    shape=false;
  }
}

function mouseReleased(){
  if(inside_bounds(mouseX,mouseY)&&(drawr||drawe)){
    shape=true;
    if(drawr&&dim[2]>dim[0]&&dim[3]>dim[1]){}
    else{
      dim[0]=dim[2];
      dim[1]=dim[3];
    }
    if(drawr){
      shapetype=0;//rectangle
      //console.log('rect');
    }
    else if(drawe){
      shapetype=1;//ellipse
      //console.log('ellipse');
    }
  }
}
function inside_bounds(x,y){
  var ib=true;
  if(x<0||x>canvaswidth||y<yoffset||y>yoffset+canvasheight||hgt/2>dim[1]-yoffset||dim[1]+hgt/2>yoffset+canvasheight)
    return false;
  else
    return true;
}

function mousetocanvas(x,y){
  pos[0]=parseFloat(x/50-xprange).toFixed(2);
  pos[1]=parseFloat((canvasheight/2-y+yoffset)/50).toFixed(2);
}

function canvastomouse(x,y){
  pos[0]=(parseFloat(xprange)+parseFloat(x))*50;
  pos[1]=yoffset+(canvasheight/2)-(y*50);
}

function f_drawr(){
  reset();
  drawr=true;
  drawe=false;
  transflag=false;
  cursor(CROSS);
}

function f_drawe(){
  reset();
  drawe=true;
  drawr=false;
  transflag=false;
  cursor(CROSS);
}

function disablebuttons(){
  b_translate.attribute('disabled',''); 
  b_rotate.attribute('disabled','');
  b_rotateanti.attribute('disabled','');
  b_refx.attribute('disabled','');
  b_refy.attribute('disabled','');
  b_refxy.attribute('disabled','');
  b_refyx.attribute('disabled','');
  b_refo.attribute('disabled','');
}

function enablebuttons(){
  b_translate.removeAttribute('disabled');
  b_rotate.removeAttribute('disabled');
  b_rotateanti.removeAttribute('disabled');
  b_refx.removeAttribute('disabled');
  b_refy.removeAttribute('disabled');
  b_refxy.removeAttribute('disabled');
  b_refyx.removeAttribute('disabled');
  b_refo.removeAttribute('disabled');
}

function reset(){
  cursor(ARROW);
  dim=[];
  wid=0;
  hgt=0;
  drawr=false;
  drawe=false;
  shape=false;
  shapetype=3;
  step=0;
  step1=0;
  pos=[];
  pos[0]=[0];
  pos[1]=[0];
  msgflag=0;
  motionx=0;
  motiony=0;
  motiondeg=0;
  init=0;
  init1=0;
  init2=0;
  rflag1=false;
  rflag2=false;
  rflag3=false;
  rotated=false;
  rotatedlater=false;
  shearx=false;
  sheary=false;
  yxflag=false;
  xyflag=false;

  ddalength=0;
  ddastep=[];
  for(var i=0;i<9999;i++){
    ddastep[i]=[];
  }

  transflag=false;
  rotateflag=false;

  i_x.value('');
  i_y.value('');
  i_rotate.value('');

  sliderx.value(1);
  slidery.value(1);

  slidersx.value(0);
  slidersy.value(0);

  enablebuttons();
}