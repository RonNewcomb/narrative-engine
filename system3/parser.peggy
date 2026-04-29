start = anything
anything     = ( escaped / code / hashtag / prompt / loneresponse / text )+
anythingelse = ( escaped / code / hashtag / text  )+

_ = [ \t]*
sp = [ \t]+

text    =     letters:[^\*\[\]\#\\]+                                            { return letters.join(""); }
word    =     letters:[^ \]\t\n\r]+                                             { return letters.join(""); }
escaped = "\\" letters:[\*\[\]\#\\]                                             { return letters; }
hashtag = "#" tag:[-A-Za-z0-9']+                                                { return ({op:'hashtag', tag: "#"+tag.join("")})}

bang = "*"
endprompt = bang _ bang
prompt = responses:response+  endprompt                                         { return ({op:'menu', responses})}
response = _ bang option:anythingelse                                           { return option; }
loneresponse = _ bang option:anythingelse                                       { return ({op:'*', option})}

code = did / didnt / if / unless / menu / plot / goto / the / cut / copy / paste / replace
did =    "[did"i sp     _ match:text "]"      wrap:anything     "[/did]"i       { return ({op:'did'   , match, wrap})}
didnt =  "[didnt"i sp   _ match:text "]"      wrap:anything     "[/didnt]"i     { return ({op:'didnt' , match, wrap})}
if =     "[if"i sp      _ match:text "]"      wrap:anything     "[/if]"i        { return ({op:'if'    , match, wrap})}
unless = "[unless"i sp  _ match:text "]"      wrap:anything     "[/unless]"i    { return ({op:'unless', match, wrap})}
menu =   "[menu"i       _ name:text? "]" responses:response+    "[/menu]"i      { return ({op:'menu'  , name, responses})}
plot =   "[plot"i sp    _ name:text  "]"                                        { return ({op:'plot'  , name})}
goto =   "[goto"i sp    _ match:text "]"                                        { return ({op:'goto'  , match})}
the  =   "[the"i sp     _ match:text "]"                                        { return ({op:'the'   , match})}
cut =    "[cut"i        _ name:text? "]"      wrap:anything     "[/cut]"i       { return ({op:'cut'   , name, wrap})}
copy  =  "[copy"i       _ name:text? "]"      wrap:anything     "[/copy]"i      { return ({op:'copy'  , name, wrap})}
paste =  "[paste"i      _ name:text? "]"                                        { return ({op:'paste' , name})}
replace ="[replace"i sp _ from:word sp to:word "]" wrap:anything "[/replace]"i  { return ({op:'replace', from, to, wrap})}
