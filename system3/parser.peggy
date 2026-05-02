start = anything
anything "anything"    = ( escaped / code / hashtag / endprompt / prompt / loneresponse / text )+ 
anythingelse "any non-prompt" = ( escaped / code / hashtag / text  )+ 

_ = [ \t\n\r]*
sp "at least one space" = [ \t\n\r]+

text       "text" = letters:[^\*\[\]\#\\]+                                            { return letters.join(""); }
word       "word" = letters:[^ \]\t\n\r]+                                             { return letters.join(""); }
qwords   "qwords" = "[" letters:[^\]]+ "]"                                            { return letters.join(""); }
words     "words" = qwords / word
escaped "escaped" = "\\" letters:[\*\[\]\#\\]                                         { return letters; }
hashtag "hashtag" = "#" tag:[-A-Za-z0-9']+                                            { return ({op:'hashtag', tag: "#"+tag.join("")})}

bang                 "bang" = "*" !{"*"}
endprompt       "endprompt" = "**"                                                    { return ({op:'**'})}
prompt             "prompt" = responses:response+  endprompt                          { return ({op:'menu', responses})}
response         "response" = _ bang option:anythingelse                              { return option; }
loneresponse "loneresponse" = _ bang option:anythingelse                              { return ({op:'*', option})}

code "code" = did / didnt / if / unless / menu / plot / goto / the / cut / copy / paste / replace
did =    "[did"i sp     _ match:text "]"      wrap:anything     "[/did]"i             { return ({op:'did'   , match, wrap})}
didnt =  "[didnt"i sp   _ match:text "]"      wrap:anything     "[/didnt]"i           { return ({op:'didnt' , match, wrap})}
if =     "[if"i sp      _ match:text "]"      wrap:anything     "[/if]"i              { return ({op:'if'    , match, wrap})}
unless = "[unless"i sp  _ match:text "]"      wrap:anything     "[/unless]"i          { return ({op:'unless', match, wrap})}
menu =   "[menu"i       _ name:text? "]" responses:response+    "[/menu]"i            { return ({op:'menu'  , name, responses})}
plot =   "[plot"i sp    _ name:text  "]"                                              { return ({op:'plot'  , name})}
goto =   "[goto"i sp    _ match:text "]"                                              { return ({op:'goto'  , match})}
the  =   "[the"i sp     _ match:text "]"                                              { return ({op:'the'   , match})}
cut =    "[cut"i        _ name:text? "]"      wrap:anything     "[/cut]"i  _          { return ({op:'cut'   , name, wrap})}
copy  =  "[copy"i       _ name:text? "]"      wrap:anything     "[/copy]"i            { return ({op:'copy'  , name, wrap})}
paste =  "[paste"i      _ name:text? "]"                                              { return ({op:'paste' , name})}
replace ="[replace"i   sp from:words sp to:words "]" wrap:anything "[/replace]"i      { return ({op:'replace', from, to, wrap})}
