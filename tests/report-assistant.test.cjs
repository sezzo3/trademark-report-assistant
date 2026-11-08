const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const context=vm.createContext({URL});
vm.runInContext(fs.readFileSync(path.join(root,'report-core.js'),'utf8'),context);
const core=context.ReportCore;
const profile={fullName:'Example Reporter',email:'reporter@example.com',holderName:'Example Owner',trademark:'Example'};
const report={platform:'github',targetUrl:'https://github.com/example/project',explanation:'The page claims to be our official support project.',evidence:'Observed on the project home page: official support claim.',reviewed:true};
test('rejects spoofed official form hosts and non-form paths',()=>{
 for(const u of ['https://support.github.com.evil.test/contact/trademark-policy','http://support.github.com/contact/trademark-policy','https://help.instagram.com/','https://support.github.com/contact/trademark-policy-fake']) assert.equal(core.platformFor(u),null);
 assert.equal(core.platformFor('https://support.github.com/contact/trademark-policy'),'github');
 assert.equal(core.platformFor('https://help.github.com/contact/trademark-policy'),'github');
});
test('requires evidence, correct destination, profile and case review',()=>{
 assert.equal(core.validateCase(report).targetUrl,report.targetUrl);
 for(const change of [{evidence:''},{explanation:''},{reviewed:false},{targetUrl:'https://evil.test/example'},{targetUrl:'https://github.com/'},{targetUrl:'https://user:pass@github.com/example'},{targetUrl:'https://github.com/example?token=private'}]) assert.throws(()=>core.validateCase({...report,...change}));
 assert.throws(()=>core.validateProfile({}));
 assert.throws(()=>core.validateProfile({...profile,website:'javascript:alert(1)'}));
});
test('mappings contain only user evidence and no signatures or legal attestations',()=>{
 for(const platform of ['x','instagram','github']){
  const c={...report,platform};
  const entries=core.entries(core.validateProfile(profile),c);
  assert.ok(entries.some(([k,v])=>v.includes(report.evidence)));
  assert.ok(entries.every(([k])=>!/signature|legal_name|good_faith|attestation|confirm/i.test(k) || k==='confirm_email'));
 }
});
test('content script rejects page senders and does not touch checkbox, signature or submit',async()=>{
 let listener;
 class Input {constructor(name,type='text'){this.name=name;this.type=type;this.tagName='INPUT';this.events=[];this._value='';this.checked=false;this.labels=[{}];} dispatchEvent(e){this.events.push(e.type);} get value(){return this._value;} set value(v){this._value=v;}}
 class Textarea extends Input {constructor(name){super(name);this.tagName='TEXTAREA';}get value(){return this._value;}set value(v){this._value=v;}}
 const ordinary=new Input('contact[name]');
 const description=new Textarea('contact[description]');
 const signature=new Input('contact[legal_name]');
 const checkbox=new Input('good_faith','checkbox');
 const submit=new Input('submit','submit');
 const nodes=[ordinary,description,signature,checkbox,submit];
 const ctx=vm.createContext({URL,ReportCore:core,HTMLInputElement:Input,HTMLTextAreaElement:Textarea,Event:class{constructor(type){this.type=type;}},location:{href:'https://support.github.com/contact/trademark-policy'},document:{querySelectorAll:()=>nodes},chrome:{runtime:{id:'test-id',getURL:p=>'chrome-extension://test-id/'+p,onMessage:{addListener:f=>listener=f}}}});
 vm.runInContext(fs.readFileSync(path.join(root,'content.js'),'utf8'),ctx);
 let called=false;
 listener({action:'prepareReport',profile,report},{id:'test-id',url:'https://evil.test/'},()=>called=true);
 assert.equal(called,false);assert.equal(ordinary.value,'');
 const response=await new Promise(resolve=>listener({action:'prepareReport',profile,report},{id:'test-id',url:'chrome-extension://test-id/popup.html'},resolve));
 assert.equal(response.ok,true);assert.equal(ordinary.value,profile.fullName);assert.ok(description.value.includes(report.evidence));
 assert.equal(signature.value,'');assert.equal(checkbox.checked,false);assert.equal(submit.value,'');
 assert.equal(signature.events.length+checkbox.events.length+submit.events.length,0);
});
test('release has no network bridge, broad permissions or embedded client credentials',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.deepEqual(m.permissions,['activeTab','storage']);assert.equal(m.host_permissions,undefined);
 for(const f of ['content.js','popup.js','report-core.js']){
  const s=fs.readFileSync(path.join(root,f),'utf8');
  assert.doesNotMatch(s,/fetch\s*\(|XMLHttpRequest|postMessage|innerHTML|10\.147\.|X-Extension-Token/i);
 }
});

test("empty or corrupt saved settings produce an empty profile",()=>{for(const value of [null,undefined,42,"invalid"])assert.equal(core.profile(value).fullName,"");});

test("validated reports retain their review confirmation across popup messaging",()=>{const validated=core.validateCase(report);assert.equal(validated.reviewed,true);assert.doesNotThrow(()=>core.validateCase(validated));});

test('Instagram mappings include current registration fields',()=>{
 const c={...report,platform:'instagram',targetUrl:'https://www.instagram.com/example/'};
 const entries=core.entries({...profile,registrationNumber:'TEST',registrationUrl:'https://example.com/registration'},c);
 assert.equal(entries.find(([key])=>key==='TMREGNUMBER')[1],'TEST');
 assert.equal(entries.find(([key])=>key==='TM_URL')[1],'https://example.com/registration');
});
