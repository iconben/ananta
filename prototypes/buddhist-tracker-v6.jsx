import { useState, useMemo } from "react";

// ─── Data Model ───────────────────────────────────────────────────────────────
// Practice:  课目（永久存在，持续累积，无目标）
// Campaign:  发愿（有目标数量 + 截止日期，依附于某课目）
// Record:    每次记录（归属某课目，可选同时计入某发愿）

const ICON_OPTIONS = ["🪷","🕯️","📜","🙇","🕯","☸️","📿","🔔","🌸","⭐","🌙","🏮","💎","🌿","🙏","🪬","🫧","🌊"];
const COLOR_OPTIONS = ["#f0c040","#a78bfa","#34d399","#fb923c","#fbbf24","#60a5fa","#f472b6","#a3e635","#e879f9","#22d3ee"];

const INIT_PRACTICES = [
  { id:"guanyin",  name:"觀音心咒",     icon:"🪷", unit:"遍", color:"#f0c040" },
  { id:"dizang",   name:"地藏菩萨名号", icon:"🕯️", unit:"遍", color:"#a78bfa" },
  { id:"yaoshi",   name:"药师经",       icon:"📜", unit:"部", color:"#34d399" },
  { id:"ketou",    name:"大礼拜",       icon:"🙇", unit:"拜", color:"#fb923c" },
  { id:"gongling", name:"供灯",         icon:"🕯",  unit:"盏", color:"#fbbf24" },
  { id:"chijie",   name:"持戒日",       icon:"☸️",  unit:"天", color:"#60a5fa" },
];

const makeHeatmap = (pid) => {
  const out={}, now=new Date(), s=pid.charCodeAt(0)*13;
  for(let i=364;i>=0;i--){
    const d=new Date(now); d.setDate(d.getDate()-i);
    const k=d.toISOString().slice(0,10);
    const r=Math.abs(Math.sin(s+i*0.37));
    out[k]=r<0.38?0:Math.floor(r*(pid==="guanyin"?90000:pid==="ketou"?200:8000));
  }
  for(let i=25;i>=0;i--){
    const d=new Date(now); d.setDate(d.getDate()-i);
    const k=d.toISOString().slice(0,10);
    out[k]=Math.floor(Math.abs(Math.sin(s*i*0.11))*(pid==="guanyin"?110000:pid==="ketou"?250:9000)+1000);
  }
  return out;
};
const BASE_HEATMAPS = Object.fromEntries(INIT_PRACTICES.map(p=>[p.id, makeHeatmap(p.id)]));

const INIT_CAMPAIGNS = [
  { id:1, name:"春季法会共修", practiceId:"guanyin", goal:5000000,  progress:3820000, start:"2026-03-01", end:"2026-03-07", done:false },
  { id:2, name:"个人三月课",   practiceId:"guanyin", goal:10000000, progress:2150000, start:"2026-03-01", end:"2026-03-31", done:false },
  { id:3, name:"元旦法会",     practiceId:"guanyin", goal:3000000,  progress:3000000, start:"2026-01-01", end:"2026-01-07", done:true  },
  { id:4, name:"百日礼拜",     practiceId:"ketou",   goal:10000,    progress:3200,    start:"2026-02-01", end:"2026-05-11", done:false },
  { id:5, name:"药师法会",     practiceId:"yaoshi",  goal:49,       progress:21,      start:"2026-03-10", end:"2026-03-19", done:false },
];

const INIT_RECORDS = [
  { id:1, date:"2026-03-17 07:30", practiceId:"guanyin",  count:21000,  note:"晨课",      campaignId:1    },
  { id:2, date:"2026-03-17 12:00", practiceId:"guanyin",  count:10800,  note:"午间念诵",  campaignId:2    },
  { id:3, date:"2026-03-17 08:00", practiceId:"ketou",    count:108,    note:"晨礼拜",    campaignId:4    },
  { id:4, date:"2026-03-16 20:15", practiceId:"guanyin",  count:54000,  note:"晚课共修",  campaignId:1    },
  { id:5, date:"2026-03-16 09:00", practiceId:"dizang",   count:1080,   note:"地藏名号",  campaignId:null },
  { id:6, date:"2026-03-16 19:00", practiceId:"yaoshi",   count:3,      note:"药师法会",  campaignId:5    },
  { id:7, date:"2026-03-15 07:00", practiceId:"guanyin",  count:21000,  note:"晨课",      campaignId:2    },
  { id:8, date:"2026-03-15 18:00", practiceId:"gongling", count:7,      note:"供七盏灯",  campaignId:null },
  { id:9, date:"2026-03-14 20:00", practiceId:"guanyin",  count:108000, note:"周末精进",  campaignId:2    },
];

const LEADERBOARD = [
  { rank:1, name:"慧明居士", av:"慧", streak:87, badges:["🏆","🔥","💎"], pts:{guanyin:12800000,ketou:5000,dizang:500000} },
  { rank:2, name:"觉心",     av:"觉", streak:62, badges:["🔥","🌸"],     pts:{guanyin:9430000,yaoshi:120} },
  { rank:3, name:"莲华",     av:"莲", streak:45, badges:["🌸","⭐"],     pts:{guanyin:8200000,dizang:300000} },
  { rank:4, name:"你(普贤)", av:"普", streak:17, badges:["⭐"],           pts:{guanyin:5970000,ketou:3200,yaoshi:21}, isMe:true },
  { rank:5, name:"净心",     av:"净", streak:33, badges:["🌸"],           pts:{guanyin:4100000} },
  { rank:6, name:"法空",     av:"法", streak:12, badges:[],               pts:{guanyin:2800000,ketou:800} },
];


// ─── Retreat seed data ────────────────────────────────────────────────────────
// Retreat:     共修活动（多人，多课目，有汇总）
// Participant: 参与者（每课目有自己的目标，自动生成对应发愿）

const INIT_RETREATS = [
  {
    id: "r1",
    name: "清明观音共修",
    desc: "清明节前后七日，共同念诵觀音心咒回向法界众生。",
    items: [
      { practiceId:"guanyin", suggestedGoal:1000000 },
    ],
    start: "2026-04-02", end: "2026-04-08",
    openJoin: true, autoEnd: true,
    creatorName: "慧明居士",
    participants: 28,
    totals: { guanyin: 18400000 },
    myParticipation: null,
  },
  {
    id: "r2",
    name: "药师法会共修",
    desc: "持诵药师经并念药师佛名号，祈愿众生离苦得乐。",
    items: [
      { practiceId:"yaoshi",  suggestedGoal: 49 },
      { practiceId:"dizang",  suggestedGoal: 1080 },
    ],
    start: "2026-03-10", end: "2026-03-19",
    openJoin: true, autoEnd: true,
    creatorName: "莲华",
    participants: 12,
    totals: { yaoshi: 441, dizang: 9720 },
    myParticipation: {
      goals: { yaoshi: 49, dizang: 1080 },
      campaignIds: { yaoshi: 5 },
    },
  },
];
// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtN = n =>
  n>=100000000?(n/100000000).toFixed(2)+"亿":
  n>=10000?(n/10000).toFixed(n>=100000?0:1)+"万":
  n.toLocaleString();

const hex2rgb = hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(",");
const uid = () => Math.random().toString(36).slice(2);

// ─── Shared UI primitives ─────────────────────────────────────────────────────
const card  = b=>({background:"rgba(255,255,255,.03)",border:`1px solid ${b||"rgba(255,255,255,.08)"}`,borderRadius:16,padding:15,marginBottom:12});
const pill  = (on,c)=>({padding:"5px 11px",borderRadius:20,border:`1px solid ${on?c+"55":"rgba(255,255,255,.1)"}`,background:on?c+"18":"rgba(255,255,255,.04)",color:on?c:"rgba(255,255,255,.4)",fontSize:12,cursor:"pointer",transition:"all .2s",userSelect:"none",whiteSpace:"nowrap"});
const pbar  = {height:4,borderRadius:2,background:"rgba(255,255,255,.07)",position:"relative",overflow:"hidden",marginTop:8};
const pfill = (p,c)=>({position:"absolute",left:0,top:0,bottom:0,width:`${Math.min(p*100,100)}%`,background:c,boxShadow:`0 0 6px ${c}70`,transition:"width 1s ease"});
const inp   = {width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"11px 13px",color:"#e5dcc8",fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
const pbtn  = v=>({padding:12,borderRadius:10,border:"none",cursor:"pointer",fontSize:14,fontFamily:"inherit",fontWeight:600,flex:1,...(v==="p"?{background:"linear-gradient(135deg,#c9952a,#f0c040)",color:"#080c18"}:{background:"rgba(255,255,255,.07)",color:"#e5dcc8"})});
const label = {fontSize:10,color:"rgba(255,255,255,.4)",letterSpacing:"0.12em",marginBottom:7};
const iconBtn = (color)=>({background:"none",border:"none",cursor:"pointer",color:color||"rgba(255,255,255,.3)",fontSize:16,padding:"2px 4px",lineHeight:1,transition:"color .15s"});

// ─── Heatmap ──────────────────────────────────────────────────────────────────
function Heatmap({data,color}){
  const weeks=useMemo(()=>{
    const res=[],today=new Date(),cur=new Date(today);
    cur.setDate(cur.getDate()-363);
    while(cur.getDay()!==0)cur.setDate(cur.getDate()-1);
    let wk=[];
    while(cur<=today){
      wk.push({k:cur.toISOString().slice(0,10),v:data[cur.toISOString().slice(0,10)]||0});
      if(wk.length===7){res.push(wk);wk=[];}
      cur.setDate(cur.getDate()+1);
    }
    if(wk.length)res.push(wk);
    return res;
  },[data]);
  const rgb=hex2rgb(color);
  const bg=v=>v===0?"rgba(255,255,255,.05)":v<500?`rgba(${rgb},.2)`:v<5000?`rgba(${rgb},.45)`:v<40000?`rgba(${rgb},.75)`:`rgba(${rgb},1)`;
  return(
    <div style={{overflowX:"auto",paddingBottom:4}}>
      <div style={{display:"flex",gap:3}}>
        {weeks.map((wk,wi)=>(
          <div key={wi} style={{display:"flex",flexDirection:"column",gap:3}}>
            {wk.map((d,di)=>(
              <div key={di} title={`${d.k}  ${d.v.toLocaleString()}`}
                style={{width:11,height:11,borderRadius:2,background:bg(d.v),cursor:"default",transition:"transform .12s"}}
                onMouseEnter={e=>e.target.style.transform="scale(1.7)"}
                onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
            ))}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:5,marginTop:6,alignItems:"center",fontSize:10,color:"rgba(255,255,255,.3)"}}>
        <span>少</span>
        {[.05,.2,.45,.75,1].map((o,i)=>(
          <div key={i} style={{width:10,height:10,borderRadius:2,background:o===.05?"rgba(255,255,255,.05)":`rgba(${rgb},${o})`}}/>
        ))}
        <span>多</span>
      </div>
    </div>
  );
}

function Ring({pct,color,size=54}){
  const r=(size-8)/2,c=2*Math.PI*r;
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={c} strokeDashoffset={c*(1-Math.min(pct,1))}
        strokeLinecap="round" style={{transition:"stroke-dashoffset 1s ease"}}/>
    </svg>
  );
}

// ─── Sheet (bottom modal wrapper) ─────────────────────────────────────────────
function Sheet({show,onClose,title,children}){
  if(!show)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"linear-gradient(180deg,#141c30,#080c18)",border:"1px solid rgba(255,255,255,.1)",borderRadius:"22px 22px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:430,maxHeight:"90vh",overflowY:"auto"}}>
        {title&&<div style={{fontSize:15,fontWeight:700,color:"#f0c040",textAlign:"center",marginBottom:20}}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function Confirm({show,message,onOk,onCancel}){
  if(!show)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:"#141c30",border:"1px solid rgba(255,255,255,.12)",borderRadius:16,padding:"24px 20px",width:"100%",maxWidth:340}}>
        <div style={{fontSize:14,color:"#e5dcc8",textAlign:"center",marginBottom:20,lineHeight:1.6}}>{message}</div>
        <div style={{display:"flex",gap:8}}>
          <button style={pbtn("s")} onClick={onCancel}>取消</button>
          <button style={{...pbtn("p"),background:"linear-gradient(135deg,#b91c1c,#ef4444)"}} onClick={onOk}>确认删除</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,       setTab]       = useState("home");
  const [practices, setPractices] = useState(INIT_PRACTICES);
  const [campaigns, setCampaigns] = useState(INIT_CAMPAIGNS);
  const [records,   setRecords]   = useState(INIT_RECORDS);
  const [heatmaps,  setHeatmaps]  = useState(BASE_HEATMAPS);
  const [liked,     setLiked]     = useState({2:true,5:true});

  // user profile & settings
  const [userProfile, setUserProfile] = useState({
    name: "普贤居士",
    avatar: "普",
    bio: "",
    dataPublic: true,       // 修持数据公开
    inRanking: true,        // 出现在排行榜
    allowFriendReq: true,   // 允许好友申请
    notifyDaily: true,      // 每日提醒
    notifyRetreat: true,    // 共修通知
    notifyFriend: true,     // 好友通知
  });
  const [fontScale,    setFontScale]    = useState(1);    // 0.85 | 1 | 1.2 | 1.45
  const [showSettings, setShowSettings] = useState(false);

  // home view state
  const [statsView,  setStatsView]  = useState("campaign");
  const [hmPid,      setHmPid]      = useState("guanyin");
  const [hmCid,      setHmCid]      = useState(1);

  // 课目详情页（null = 首页，string = 某课目 id）
  const [detailPid, setDetailPid] = useState(null);
  // 发愿详情页（null = 列表，number = 某发愿 id）
  const [detailCid, setDetailCid] = useState(null);

  // 统计 tab
  const [statsPeriod, setStatsPeriod] = useState("month"); // "week"|"month"|"year"

  // 共修 tab
  const [retreats,      setRetreats]      = useState(INIT_RETREATS);
  const [detailRid,     setDetailRid]     = useState(null);  // 共修详情页
  const [showCreateR,   setShowCreateR]   = useState(false); // 发起共修 sheet
  const [showJoinR,     setShowJoinR]     = useState(null);  // 加入共修 sheet (retreat id)
  const [shareRid,      setShareRid]      = useState(null);  // 分享 sheet
  // create form
  const [editR, setEditR] = useState({name:"",desc:"",start:"",end:"",openJoin:true,autoEnd:true,items:[]});
  // join form: {practiceId -> goal string}
  const [joinGoals, setJoinGoals] = useState({});

  // ── Log sheet ──
  const [showLog, setShowLog] = useState(false);
  const [logPid,  setLogPid]  = useState("guanyin");
  const [logN,    setLogN]    = useState("");
  const [logNote, setLogNote] = useState("");
  const [logCid,  setLogCid]  = useState(null);

  // ── Practice edit sheet ──
  const [practiceSheet, setPracticeSheet] = useState(null); // null | {mode:"new"|"edit", data:{...}}
  const [editP, setEditP] = useState({name:"",icon:"🪷",unit:"遍",color:"#f0c040"});

  // ── Campaign edit sheet ──
  const [campaignSheet, setCampaignSheet] = useState(null); // null | {mode:"new"|"edit", data:{...}}
  const [editC, setEditC] = useState({name:"",practiceId:"guanyin",goal:"",start:"",end:""});

  // ── Confirm ──
  const [confirm, setConfirm] = useState(null); // null | {message, onOk}

  const streak = 17;
  const getPractice = id => practices.find(p=>p.id===id) ?? practices[0];

  // ── Derived ──────────────────────────────────────────────────────────────
  const practiceStats = useMemo(()=>practices.map(p=>{
    const fromHM  = Object.values(heatmaps[p.id]||{}).reduce((a,b)=>a+b,0);
    const fromRec = records.filter(r=>r.practiceId===p.id).reduce((a,r)=>a+r.count,0);
    const todayKey = new Date().toISOString().slice(0,10);
    const today   = records.filter(r=>r.practiceId===p.id&&r.date.startsWith(todayKey)).reduce((a,r)=>a+r.count,0);
    return {...p,total:fromHM+fromRec,today};
  }),[practices,records,heatmaps]);

  const campaignProgress = useMemo(()=>campaigns.map(c=>{
    const extra=records.filter(r=>r.campaignId===c.id).reduce((a,r)=>a+r.count,0);
    return {...c,progress:c.progress+extra};
  }),[campaigns,records]);

  const activeCampaigns = campaignProgress.filter(c=>!c.done);
  const availCampaigns  = activeCampaigns.filter(c=>c.practiceId===logPid);

  // ── Handlers: log ─────────────────────────────────────────────────────────
  const handleLog = ()=>{
    const n=parseInt(logN); if(!n||n<=0)return;
    const ds=new Date().toISOString().replace("T"," ").slice(0,16);
    setRecords(prev=>[{id:uid(),date:ds,practiceId:logPid,count:n,note:logNote||"功课记录",campaignId:logCid},...prev]);
    setLogN(""); setLogNote(""); setLogCid(null); setShowLog(false);
  };

  // ── Handlers: practice ────────────────────────────────────────────────────
  const openNewPractice = ()=>{
    setEditP({name:"",icon:"🪷",unit:"遍",color:"#f0c040"});
    setPracticeSheet({mode:"new"});
  };
  const openEditPractice = p=>{
    setEditP({name:p.name,icon:p.icon,unit:p.unit,color:p.color});
    setPracticeSheet({mode:"edit",id:p.id});
  };
  const savePractice = ()=>{
    if(!editP.name.trim())return;
    if(practiceSheet.mode==="new"){
      const id=uid();
      setPractices(prev=>[...prev,{id,...editP}]);
      setHeatmaps(prev=>({...prev,[id]:{}}));
    } else {
      setPractices(prev=>prev.map(p=>p.id===practiceSheet.id?{...p,...editP}:p));
    }
    setPracticeSheet(null);
  };
  const deletePractice = id=>{
    setConfirm({
      message:"删除此课目将同时删除所有相关记录和发愿，确认吗？",
      onOk:()=>{
        setPractices(prev=>prev.filter(p=>p.id!==id));
        setCampaigns(prev=>prev.filter(c=>c.practiceId!==id));
        setRecords(prev=>prev.filter(r=>r.practiceId!==id));
        setHeatmaps(prev=>{ const n={...prev}; delete n[id]; return n; });
        if(hmPid===id) setHmPid(practices[0]?.id);
        setConfirm(null); setPracticeSheet(null);
      }
    });
  };

  // ── Handlers: campaign ────────────────────────────────────────────────────
  const openNewCampaign = (practiceId)=>{
    const today=new Date().toISOString().slice(0,10);
    setEditC({name:"",practiceId:practiceId||practices[0]?.id,goal:"",start:today,end:""});
    setCampaignSheet({mode:"new"});
  };
  const openEditCampaign = c=>{
    setEditC({name:c.name,practiceId:c.practiceId,goal:String(c.goal),start:c.start,end:c.end});
    setCampaignSheet({mode:"edit",id:c.id});
  };
  const saveCampaign = ()=>{
    if(!editC.name.trim()||!editC.goal||!editC.end)return;
    if(campaignSheet.mode==="new"){
      setCampaigns(prev=>[...prev,{id:Date.now(),name:editC.name,practiceId:editC.practiceId,goal:parseInt(editC.goal),progress:0,start:editC.start,end:editC.end,done:false}]);
    } else {
      setCampaigns(prev=>prev.map(c=>c.id===campaignSheet.id?{...c,name:editC.name,practiceId:editC.practiceId,goal:parseInt(editC.goal),start:editC.start,end:editC.end}:c));
    }
    setCampaignSheet(null);
  };
  const markCampaignDone = id=>setCampaigns(prev=>prev.map(c=>c.id===id?{...c,done:true}:c));
  const deleteCampaign = id=>{
    setConfirm({
      message:"删除此发愿？相关记录不会被删除，但将不再归属此发愿。",
      onOk:()=>{
        setCampaigns(prev=>prev.filter(c=>c.id!==id));
        setRecords(prev=>prev.map(r=>r.campaignId===id?{...r,campaignId:null}:r));
        setConfirm(null); setCampaignSheet(null);
      }
    });
  };

  // ── Practice Detail Page ─────────────────────────────────────────────────────
  const PracticeDetailPage = ({pid})=>{
    const p = getPractice(pid);
    const stat = practiceStats.find(s=>s.id===pid)||p;
    const practiceRecords = records.filter(r=>r.practiceId===pid);
    const relatedCampaigns = campaignProgress.filter(c=>c.practiceId===pid);

    return(
      <div>
        {/* Back button + header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div onClick={()=>setDetailPid(null)}
            style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.6)",flexShrink:0}}>‹</div>
          <div style={{fontSize:24}}>{p.icon}</div>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:p.color}}>{p.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>累计 {fmtN(stat.total)} {p.unit}</div>
          </div>
          <div style={{marginLeft:"auto"}}>
            <div onClick={()=>openEditPractice(p)} style={{fontSize:13,cursor:"pointer",color:"rgba(255,255,255,.3)"}}>✎ 编辑</div>
          </div>
        </div>

        {/* Heatmap */}
        <div style={card(`${p.color}28`)}>
          <div style={{fontSize:10,letterSpacing:"0.14em",color:p.color,marginBottom:10}}>活跃热力图</div>
          <Heatmap data={heatmaps[pid]||{}} color={p.color}/>
        </div>

        {/* Related campaigns */}
        {relatedCampaigns.length>0&&(
          <div style={card(`${p.color}18`)}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:10}}>🏮 相关发愿</div>
            {relatedCampaigns.map(c=>{
              const pct=c.progress/c.goal;
              const daysLeft=Math.ceil((new Date(c.end)-new Date())/86400000);
              return(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <Ring pct={pct} color={c.done?"#4ade80":p.color} size={40}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:13,fontWeight:600}}>{c.name}</span>
                      {c.done
                        ? <span style={{fontSize:10,color:"#4ade80"}}>✓ 圆满</span>
                        : <span style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>剩{daysLeft}天</span>
                      }
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:2}}>
                      <span style={{color:p.color}}>{fmtN(c.progress)} {p.unit}</span>
                      <span style={{color:"rgba(255,255,255,.3)"}}>/ {fmtN(c.goal)}</span>
                    </div>
                    <div style={pbar}><div style={pfill(pct,c.done?"#4ade80":p.color)}/></div>
                  </div>
                  <div style={{fontSize:14,cursor:"pointer",color:"rgba(255,255,255,.2)"}}
                    onClick={()=>openEditCampaign(campaigns.find(x=>x.id===c.id))}>✎</div>
                </div>
              );
            })}
            {/* Merged total — only meaningful when there are 2+ campaigns */}
            {relatedCampaigns.length>1&&(()=>{
              const tP=relatedCampaigns.reduce((a,c)=>a+c.progress,0);
              const tG=relatedCampaigns.reduce((a,c)=>a+c.goal,0);
              return(
                <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.07)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span style={{color:"rgba(255,255,255,.4)",letterSpacing:"0.08em"}}>跨发愿合并</span>
                    <span style={{color:p.color,fontWeight:700}}>{fmtN(tP)} / {fmtN(tG)} {p.unit}</span>
                  </div>
                  <div style={pbar}><div style={pfill(tP/tG,p.color)}/></div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Records list */}
        <div style={card()}>
          <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>📿 历史记录</div>
          {practiceRecords.length===0&&(
            <div style={{textAlign:"center",color:"rgba(255,255,255,.25)",padding:"16px 0",fontSize:12}}>暂无记录</div>
          )}
          {practiceRecords.map((r,i)=>{
            const camp=campaignProgress.find(c=>c.id===r.campaignId);
            return(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<practiceRecords.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600}}>{r.note}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:1}}>{r.date}</div>
                  {camp
                    ? <div style={{fontSize:10,color:p.color,marginTop:1}}>🏮 {camp.name}</div>
                    : <div style={{fontSize:10,color:"rgba(255,255,255,.18)",marginTop:1}}>日常累积</div>
                  }
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:15,color:p.color,fontWeight:700}}>{r.count.toLocaleString()}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{p.unit}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Campaign Detail Page ─────────────────────────────────────────────────────
  const CampaignDetailPage = ({cid})=>{
    const c = campaignProgress.find(x=>x.id===cid);
    if(!c) return null;
    const p = getPractice(c.practiceId);
    const pct = c.progress / c.goal;
    const daysLeft = Math.ceil((new Date(c.end)-new Date())/86400000);
    const done = c.done;

    // heatmap: only records belonging to this campaign
    const cHm = useMemo(()=>{
      const h={};
      records.filter(r=>r.campaignId===cid).forEach(r=>{
        const k=r.date.slice(0,10); h[k]=(h[k]||0)+r.count;
      });
      return h;
    },[records,cid]);

    const cRecords = records.filter(r=>r.campaignId===cid);

    return(
      <div>
        {/* Back + header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div onClick={()=>setDetailCid(null)}
            style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.6)",flexShrink:0}}>‹</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:17,fontWeight:700}}>{c.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
              <span style={{fontSize:11,background:`${p.color}18`,color:p.color,border:`1px solid ${p.color}35`,borderRadius:20,padding:"2px 8px"}}>{p.icon} {p.name}</span>
              {done
                ? <span style={{fontSize:11,background:"rgba(74,222,128,.12)",color:"#4ade80",border:"1px solid rgba(74,222,128,.3)",borderRadius:20,padding:"2px 8px"}}>✓ 圆满</span>
                : <span style={{fontSize:11,background:`${p.color}12`,color:p.color,border:`1px solid ${p.color}28`,borderRadius:20,padding:"2px 8px"}}>剩 {daysLeft} 天</span>
              }
            </div>
          </div>
          <div onClick={()=>openEditCampaign(campaigns.find(x=>x.id===cid))}
            style={{fontSize:13,cursor:"pointer",color:"rgba(255,255,255,.3)",flexShrink:0}}>✎ 编辑</div>
        </div>

        {/* Progress */}
        <div style={card(`${p.color}28`)}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
              <Ring pct={pct} color={done?"#4ade80":p.color} size={80}/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:done?"#4ade80":p.color,fontWeight:700}}>{(pct*100).toFixed(0)}%</div>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                <span style={{color:p.color,fontWeight:700}}>{fmtN(c.progress)} {p.unit}</span>
                <span style={{color:"rgba(255,255,255,.4)"}}>目标 {fmtN(c.goal)}</span>
              </div>
              <div style={pbar}><div style={pfill(pct,done?"#4ade80":p.color)}/></div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:5}}>
                {done ? "已圆满" : `还差 ${fmtN(c.goal-c.progress)} ${p.unit}`}
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:3}}>
                {c.start} ~ {c.end}
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div style={card(`${p.color}20`)}>
          <div style={{fontSize:10,letterSpacing:"0.14em",color:p.color,marginBottom:10}}>此发愿活跃图</div>
          <Heatmap data={cHm} color={p.color}/>
        </div>

        {/* Records */}
        <div style={card()}>
          <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>📿 记录明细</div>
          {cRecords.length===0&&(
            <div style={{textAlign:"center",color:"rgba(255,255,255,.25)",padding:"16px 0",fontSize:12}}>暂无记录</div>
          )}
          {cRecords.map((r,i)=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<cRecords.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600}}>{r.note}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:1}}>{r.date}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:15,color:p.color,fontWeight:700}}>{r.count.toLocaleString()}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{p.unit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Home Tab ──────────────────────────────────────────────────────────────
  const HomeTab = ()=>{
    const hmData = statsView==="practice"
      ? (heatmaps[hmPid]||{})
      : (()=>{ const h={}; records.filter(r=>r.campaignId===hmCid).forEach(r=>{const k=r.date.slice(0,10);h[k]=(h[k]||0)+r.count;}); return h; })();
    const hmColor = statsView==="practice"
      ? (getPractice(hmPid).color)
      : (getPractice(campaignProgress.find(c=>c.id===hmCid)?.practiceId)?.color||"#f0c040");

    if(detailPid) return <PracticeDetailPage pid={detailPid}/>;
    if(detailCid) return <CampaignDetailPage cid={detailCid}/>;
    return(
      <div>
        {/* View toggle */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          <div style={pill(statsView==="campaign","#f0c040")} onClick={()=>setStatsView("campaign")}>按发愿</div>
          <div style={pill(statsView==="practice","#f0c040")} onClick={()=>setStatsView("practice")}>按课目</div>
        </div>

        {statsView==="practice" ? (<>
          {/* Practice grid */}
          <div style={card("rgba(240,192,64,.18)")}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>☸ 我的课目</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {practiceStats.map(p=>(
                <div key={p.id} style={{position:"relative",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"10px 8px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}
                  onClick={()=>setDetailPid(p.id)}>
                  {/* edit btn */}
                  <div style={{position:"absolute",top:4,right:4}} onClick={e=>{e.stopPropagation();openEditPractice(p);}}>
                    <span style={{fontSize:10,color:"rgba(255,255,255,.2)",cursor:"pointer"}}>✎</span>
                  </div>
                  <div style={{fontSize:19}}>{p.icon}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.45)",marginTop:4,lineHeight:1.3}}>{p.name}</div>
                  <div style={{fontSize:14,fontWeight:700,color:"#e5dcc8",marginTop:4}}>{fmtN(p.total)}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.25)",marginTop:1}}>累计{p.unit}</div>
                  {p.today>0&&<div style={{fontSize:9,color:p.color,marginTop:2}}>今日+{fmtN(p.today)}</div>}
                </div>
              ))}
            </div>
          </div>
          {/* New practice button */}
          <div onClick={openNewPractice} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(255,255,255,.02)",border:"1px dashed rgba(240,192,64,.25)",borderRadius:16,padding:"14px",marginBottom:12,cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(240,192,64,.06)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"}>
            <span style={{fontSize:18,color:"rgba(240,192,64,.5)"}}>＋</span>
            <span style={{fontSize:13,color:"rgba(240,192,64,.6)",letterSpacing:"0.05em"}}>新建课目</span>
          </div>

          {/* hint */}
          <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,.2)",marginBottom:4}}>
            点击课目卡片查看热力图与历史记录
          </div>

        </>) : (<>
          {/* Campaign list — active */}
          <div style={card()}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>🏮 进行中的发愿</div>
            {activeCampaigns.length===0&&(
              <div style={{textAlign:"center",color:"rgba(255,255,255,.25)",fontSize:12,padding:"10px 0"}}>暂无进行中的发愿</div>
            )}
            {activeCampaigns.map(c=>{
              const p=getPractice(c.practiceId),pct=c.progress/c.goal;
              const daysLeft=Math.ceil((new Date(c.end)-new Date())/86400000);
              return(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 6px",borderRadius:10,marginBottom:2,cursor:"pointer",transition:"background .2s"}}
                  onClick={()=>setDetailCid(c.id)}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Ring pct={pct} color={p.color} size={44}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:13,fontWeight:600}}>{c.name}</span>
                      <span style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>剩{daysLeft}天</span>
                    </div>
                    <div style={{fontSize:10,color:p.color,marginTop:2}}>{p.icon} {p.name}</div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:3}}>
                      <span style={{color:p.color}}>{fmtN(c.progress)} {p.unit}</span>
                      <span style={{color:"rgba(255,255,255,.3)"}}>/ {fmtN(c.goal)}</span>
                    </div>
                    <div style={pbar}><div style={pfill(pct,p.color)}/></div>
                  </div>
                  <div style={{fontSize:14,color:"rgba(255,255,255,.2)",flexShrink:0}}>›</div>
                </div>
              );
            })}
          </div>
          {/* Campaign list — done */}
          {campaignProgress.filter(c=>c.done).length>0&&(
            <div style={card()}>
              <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>✓ 已圆满的发愿</div>
              {campaignProgress.filter(c=>c.done).map(c=>{
                const p=getPractice(c.practiceId);
                return(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 6px",borderRadius:10,marginBottom:2,cursor:"pointer",opacity:.7,transition:"opacity .2s"}}
                    onClick={()=>setDetailCid(c.id)}
                    onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                    onMouseLeave={e=>e.currentTarget.style.opacity=".7"}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✓</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{c.name}</div>
                      <div style={{fontSize:10,color:p.color,marginTop:2}}>{p.icon} {p.name}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:1}}>{c.start} ~ {c.end}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:13,color:"#4ade80",fontWeight:700}}>{fmtN(c.progress)}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{p.unit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* New campaign button */}
          <div onClick={()=>openNewCampaign()} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(255,255,255,.02)",border:"1px dashed rgba(240,192,64,.25)",borderRadius:16,padding:"14px",marginBottom:12,cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(240,192,64,.06)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"}>
            <span style={{fontSize:18,color:"rgba(240,192,64,.5)"}}>＋</span>
            <span style={{fontSize:13,color:"rgba(240,192,64,.6)",letterSpacing:"0.05em"}}>新建发愿</span>
          </div>
        </>)}
      </div>
    );
  };

  // ── Stats Tab ────────────────────────────────────────────────────────────────
  const StatsTab = ()=>{
    // Build period buckets from records + heatmap data
    const now = new Date();
    const periods = useMemo(()=>{
      const buckets = [];
      if(statsPeriod==="week"){
        for(let i=11;i>=0;i--){
          const d=new Date(now); d.setDate(d.getDate()-i*7);
          const start=new Date(d); start.setDate(start.getDate()-start.getDay());
          const end=new Date(start); end.setDate(end.getDate()+6);
          buckets.push({label:`${start.getMonth()+1}/${start.getDate()}`,start,end});
        }
      } else if(statsPeriod==="month"){
        for(let i=5;i>=0;i--){
          const d=new Date(now.getFullYear(),now.getMonth()-i,1);
          const end=new Date(d.getFullYear(),d.getMonth()+1,0);
          const mNames=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
          buckets.push({label:mNames[d.getMonth()],start:d,end});
        }
      } else {
        for(let i=2;i>=0;i--){
          const y=now.getFullYear()-i;
          buckets.push({label:`${y}年`,start:new Date(y,0,1),end:new Date(y,11,31)});
        }
      }
      return buckets;
    },[statsPeriod]);

    // For each bucket, sum records per practice
    const bucketData = useMemo(()=>periods.map(b=>{
      const totals={};
      practices.forEach(p=>{
        // from records
        const fromRec=records
          .filter(r=>r.practiceId===p.id)
          .filter(r=>{ const d=new Date(r.date); return d>=b.start&&d<=b.end; })
          .reduce((a,r)=>a+r.count,0);
        // from heatmap
        const hm=heatmaps[p.id]||{};
        const fromHM=Object.entries(hm)
          .filter(([k])=>{ const d=new Date(k); return d>=b.start&&d<=b.end; })
          .reduce((a,[,v])=>a+v,0);
        totals[p.id]=fromRec+fromHM;
      });
      return {...b,totals};
    }),[periods,records,heatmaps,practices]);

    // Max value for bar scaling
    const maxVal = useMemo(()=>{
      let m=0;
      bucketData.forEach(b=>{ const s=Object.values(b.totals).reduce((a,v)=>a+v,0); if(s>m)m=s; });
      return m||1;
    },[bucketData]);

    // Per-practice totals for the most recent complete period
    const latestBucket = bucketData[bucketData.length-1];
    const prevBucket   = bucketData[bucketData.length-2];

    return(
      <div>
        {/* Period selector */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["week","近12周"],["month","近6月"],["year","近3年"]].map(([v,l])=>(
            <div key={v} style={pill(statsPeriod===v,"#f0c040")} onClick={()=>setStatsPeriod(v)}>{l}</div>
          ))}
        </div>

        {/* Stacked bar chart */}
        <div style={card()}>
          <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:14}}>📊 各课目修持量</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:120}}>
            {bucketData.map((b,bi)=>{
              const total=Object.values(b.totals).reduce((a,v)=>a+v,0);
              const barH=total/maxVal*110;
              const isLast=bi===bucketData.length-1;
              return(
                <div key={bi} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:"100%",display:"flex",flexDirection:"column-reverse",height:barH,borderRadius:"3px 3px 0 0",overflow:"hidden",minHeight:total>0?2:0}}>
                    {practices.map(p=>{
                      const v=b.totals[p.id]||0;
                      if(!v)return null;
                      return <div key={p.id} style={{width:"100%",height:`${v/total*100}%`,background:p.color,opacity:isLast?1:.65}}/>;
                    })}
                  </div>
                  <div style={{fontSize:9,color:isLast?"rgba(255,255,255,.6)":"rgba(255,255,255,.25)",marginTop:4,textAlign:"center"}}>{b.label}</div>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
            {practices.filter(p=>Object.values(latestBucket?.totals||{}).some((_,i)=>Object.keys(latestBucket?.totals||{})[i]===p.id&&_>0)).map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"rgba(255,255,255,.5)"}}>
                <div style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
                {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* Per-practice breakdown for latest period */}
        <div style={card()}>
          <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>
            📋 {latestBucket?.label} · 各课目汇总
          </div>
          {practices.map(p=>{
            const cur=latestBucket?.totals[p.id]||0;
            const prev=prevBucket?.totals[p.id]||0;
            const delta=prev>0?Math.round((cur-prev)/prev*100):null;
            if(!cur&&!prev) return null;
            return(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:`${p.color}15`,border:`1px solid ${p.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{p.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{p.name}</div>
                  <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.07)",marginTop:5,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${Math.min(cur/maxVal*100,100)}%`,background:p.color,transition:"width 1s"}}/>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:15,color:p.color,fontWeight:700}}>{fmtN(cur)}</div>
                  <div style={{fontSize:9,color:p.unit}}>{p.unit}</div>
                  {delta!==null&&(
                    <div style={{fontSize:9,color:delta>=0?"#4ade80":"#f87171",marginTop:1}}>
                      {delta>=0?"↑":"↓"}{Math.abs(delta)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Click into detail hint */}
        <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,.2)",marginTop:4,marginBottom:8}}>
          点击首页课目卡片可查看历史记录明细
        </div>
      </div>
    );
  };

  // ── Retreat handlers ─────────────────────────────────────────────────────────
  const handleCreateRetreat = () => {
    if(!editR.name.trim()||!editR.start||!editR.end||!editR.items.length) return;
    const newR = {
      id: uid(), name:editR.name, desc:editR.desc,
      items: editR.items, start:editR.start, end:editR.end,
      openJoin:editR.openJoin, autoEnd:editR.autoEnd,
      creatorName:"普贤居士", participants:1,
      totals: Object.fromEntries(editR.items.map(it=>[it.practiceId,0])),
      myParticipation: { goals: Object.fromEntries(editR.items.map(it=>[it.practiceId, it.suggestedGoal||0])), campaignIds:{} },
    };
    // auto-create campaigns for each item
    editR.items.forEach(it=>{
      const p = practices.find(x=>x.id===it.practiceId);
      if(!p) return;
      const cid = Date.now() + Math.random();
      setCampaigns(prev=>[...prev,{
        id:cid, name:`${editR.name} · ${p.name}`,
        practiceId:it.practiceId, goal:it.suggestedGoal||1,
        progress:0, start:editR.start, end:editR.end, done:false,
      }]);
    });
    setRetreats(prev=>[newR,...prev]);
    setEditR({name:"",desc:"",start:"",end:"",openJoin:true,autoEnd:true,items:[]});
    setShowCreateR(false);
  };

  const handleJoinRetreat = (rid) => {
    const r = retreats.find(x=>x.id===rid);
    if(!r) return;
    const newCampaignIds = {};
    r.items.forEach(it=>{
      const p = practices.find(x=>x.id===it.practiceId);
      const goal = parseInt(joinGoals[it.practiceId])||it.suggestedGoal||1;
      const cid = Date.now() + Math.random();
      newCampaignIds[it.practiceId] = cid;
      setCampaigns(prev=>[...prev,{
        id:cid, name:`${r.name} · ${p.name}`,
        practiceId:it.practiceId, goal, progress:0,
        start:r.start, end:r.end, done:false,
      }]);
    });
    setRetreats(prev=>prev.map(x=>x.id===rid?{
      ...x, participants:x.participants+1,
      myParticipation:{ goals: Object.fromEntries(r.items.map(it=>[it.practiceId,parseInt(joinGoals[it.practiceId])||it.suggestedGoal||1])), campaignIds:newCampaignIds },
    }:x));
    setJoinGoals({});
    setShowJoinR(null);
    setDetailRid(rid);
  };

  // ── Retreat Detail Page ───────────────────────────────────────────────────────
  const RetreatDetailPage = ({rid})=>{
    const r = retreats.find(x=>x.id===rid);
    if(!r) return null;
    const now = new Date();
    const ended = new Date(r.end) < now;
    const daysLeft = Math.ceil((new Date(r.end)-now)/86400000);
    const joined = !!r.myParticipation;

    return(
      <div>
        {/* Back + header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div onClick={()=>setDetailRid(null)}
            style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.6)",flexShrink:0}}>‹</div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:700}}>{r.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>{r.start} ~ {r.end} · 发起人：{r.creatorName}</div>
          </div>
          {/* Share button */}
          <div onClick={()=>setShareRid(rid)}
            style={{fontSize:12,color:"rgba(240,192,64,.7)",cursor:"pointer",background:"rgba(240,192,64,.1)",border:"1px solid rgba(240,192,64,.25)",borderRadius:20,padding:"4px 10px"}}>
            分享
          </div>
        </div>

        {/* Status banner */}
        <div style={{...card(ended?"rgba(255,255,255,.1)":"rgba(240,192,64,.2)"),background:ended?"rgba(255,255,255,.02)":"rgba(240,192,64,.05)",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,color:ended?"rgba(255,255,255,.4)":"#f0c040",fontWeight:600}}>
                {ended?"已结束":"进行中"}
              </div>
              {!ended&&<div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>还剩 {daysLeft} 天</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:22,fontWeight:700,color:ended?"rgba(255,255,255,.4)":"#f0c040"}}>{r.participants}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>人参与</div>
            </div>
          </div>
          {r.desc&&<div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:10,lineHeight:1.6,borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:8}}>{r.desc}</div>}
        </div>

        {/* Per-practice totals (anonymous) */}
        <div style={card()}>
          <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>☸ 共修合计（匿名汇总）</div>
          {r.items.map(it=>{
            const p = getPractice(it.practiceId);
            const total = r.totals[it.practiceId]||0;
            const totalGoal = it.suggestedGoal ? it.suggestedGoal * r.participants : 0;
            const pct = totalGoal>0 ? total/totalGoal : 0;
            return(
              <div key={it.practiceId} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:16}}>{p.icon}</span>
                    <span style={{fontSize:13,fontWeight:600}}>{p.name}</span>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <span style={{fontSize:14,color:p.color,fontWeight:700}}>{fmtN(total)}</span>
                    <span style={{fontSize:10,color:"rgba(255,255,255,.3)",marginLeft:4}}>{p.unit}</span>
                  </div>
                </div>
                {totalGoal>0&&(
                  <>
                    <div style={pbar}><div style={pfill(pct,p.color)}/></div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:3}}>
                      共 {r.participants} 人参与 · 建议目标 {fmtN(it.suggestedGoal)} {p.unit}/人
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* My participation */}
        {joined ? (
          <div style={card("rgba(74,222,128,.15)")}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(74,222,128,.7)",marginBottom:12}}>✓ 我的发愿</div>
            {r.items.map(it=>{
              const p = getPractice(it.practiceId);
              const myGoal = r.myParticipation.goals[it.practiceId]||0;
              const cid = r.myParticipation.campaignIds?.[it.practiceId];
              const camp = cid ? campaignProgress.find(c=>c.id===cid) : null;
              const myProgress = camp ? camp.progress : 0;
              const pct = myGoal>0 ? myProgress/myGoal : 0;
              return(
                <div key={it.practiceId} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12}}>{p.icon} {p.name}</span>
                    <span style={{fontSize:12,color:p.color,fontWeight:700}}>{fmtN(myProgress)} / {fmtN(myGoal)} {p.unit}</span>
                  </div>
                  <div style={pbar}><div style={pfill(pct,pct>=1?"#4ade80":p.color)}/></div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>
                    {camp ? `发愿：${camp.name}` : "日常累积"}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div onClick={()=>setShowJoinR(rid)}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(240,192,64,.08)",border:"1px solid rgba(240,192,64,.3)",borderRadius:16,padding:"16px",marginBottom:12,cursor:"pointer"}}>
            <span style={{fontSize:16}}>🙏</span>
            <span style={{fontSize:14,color:"#f0c040",fontWeight:600}}>加入此共修</span>
          </div>
        )}
      </div>
    );
  };

  // ── Retreats Tab (共修) ───────────────────────────────────────────────────────
  const RetreatsTab = ()=>{
    if(detailRid) return <RetreatDetailPage rid={detailRid}/>;
    const myRetreats    = retreats.filter(r=>r.myParticipation);
    const otherRetreats = retreats.filter(r=>!r.myParticipation);
    const now = new Date();

    return(
      <div>
        {/* My retreats */}
        {myRetreats.length>0&&(
          <div style={card()}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>🏮 我参与的共修</div>
            {myRetreats.map(r=>{
              const ended = new Date(r.end)<now;
              const daysLeft = Math.ceil((new Date(r.end)-now)/86400000);
              return(
                <div key={r.id} onClick={()=>setDetailRid(r.id)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"9px 6px",borderRadius:10,cursor:"pointer",transition:"background .2s",marginBottom:2}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(240,192,64,.1)",border:"1px solid rgba(240,192,64,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🏮</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600}}>{r.name}</div>
                    <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                      {r.items.map(it=>{ const p=getPractice(it.practiceId); return(
                        <span key={it.practiceId} style={{fontSize:9,color:p.color,background:`${p.color}15`,borderRadius:8,padding:"1px 6px"}}>{p.icon}{p.name}</span>
                      );})}
                    </div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>{r.participants} 人参与</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    {ended
                      ? <span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>已结束</span>
                      : <span style={{fontSize:10,color:"#f0c040"}}>剩{daysLeft}天</span>
                    }
                    <div style={{fontSize:14,color:"rgba(255,255,255,.2)",marginTop:2}}>›</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Other retreats (shared with me, not yet joined) */}
        {otherRetreats.length>0&&(
          <div style={card("rgba(240,192,64,.1)")}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>🌸 收到的共修邀请</div>
            {otherRetreats.map(r=>{
              const daysLeft = Math.ceil((new Date(r.end)-now)/86400000);
              return(
                <div key={r.id} onClick={()=>setDetailRid(r.id)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"9px 6px",borderRadius:10,cursor:"pointer",transition:"background .2s",marginBottom:2}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🏮</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600}}>{r.name}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:2}}>发起人：{r.creatorName} · {r.participants}人</div>
                    <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                      {r.items.map(it=>{ const p=getPractice(it.practiceId); return(
                        <span key={it.practiceId} style={{fontSize:9,color:p.color,background:`${p.color}15`,borderRadius:8,padding:"1px 6px"}}>{p.icon}{p.name}</span>
                      );})}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <span style={{fontSize:10,color:"#f0c040"}}>剩{daysLeft}天</span>
                    <div style={{fontSize:14,color:"rgba(255,255,255,.2)",marginTop:2}}>›</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {myRetreats.length===0&&otherRetreats.length===0&&(
          <div style={{...card(),textAlign:"center",padding:"32px 16px"}}>
            <div style={{fontSize:36,marginBottom:12}}>🏮</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.4)",marginBottom:6}}>暂无共修活动</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.2)",lineHeight:1.7}}>发起一次共修，邀请道友一同精进</div>
          </div>
        )}

        {/* Create retreat button */}
        <div onClick={()=>setShowCreateR(true)}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(255,255,255,.02)",border:"1px dashed rgba(240,192,64,.25)",borderRadius:16,padding:"14px",marginBottom:12,cursor:"pointer",transition:"all .2s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(240,192,64,.06)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"}>
          <span style={{fontSize:18,color:"rgba(240,192,64,.5)"}}>＋</span>
          <span style={{fontSize:13,color:"rgba(240,192,64,.6)",letterSpacing:"0.05em"}}>发起共修</span>
        </div>
      </div>
    );
  };

  // ── Friends Tab (善友) ────────────────────────────────────────────────────────
  const FriendsTab = ()=>{
    const [friendsSubTab, setFriendsSubTab] = useState("feed"); // "feed"|"ranking"|"badges"

    const subTabs = [
      {id:"feed",    label:"动态"},
      {id:"ranking", label:"排行"},
      {id:"badges",  label:"成就"},
    ];

    // Fake friend feed data
    const FEED = [
      {id:1, name:"慧明居士", av:"慧", time:"今天", items:[
        {practiceId:"guanyin", count:54000},
        {practiceId:"ketou",   count:108},
      ]},
      {id:2, name:"觉心", av:"觉", time:"今天", items:[
        {practiceId:"guanyin", count:21000},
      ]},
      {id:3, name:"莲华", av:"莲", time:"昨天", items:[
        {practiceId:"guanyin", count:108000},
        {practiceId:"dizang",  count:1080},
      ]},
      {id:4, name:"净心", av:"净", time:"昨天", items:[
        {practiceId:"guanyin", count:10800},
      ]},
    ];

    return(
      <div>
        {/* Sub-tab bar */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {subTabs.map(t=>(
            <div key={t.id} style={pill(friendsSubTab===t.id,"#f0c040")} onClick={()=>setFriendsSubTab(t.id)}>
              {t.label}
            </div>
          ))}
          {/* Friend requests hint */}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,fontSize:11,color:"rgba(255,255,255,.3)",cursor:"pointer"}}
            onClick={()=>alert("好友管理即将上线")}>
            <span>好友</span>
            <span style={{background:"rgba(240,192,64,.2)",color:"#f0c040",borderRadius:20,padding:"1px 7px",fontSize:10}}>+</span>
          </div>
        </div>

        {friendsSubTab==="feed"&&(
          <div>
            {FEED.map(u=>(
              <div key={u.id} style={card()}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,flexShrink:0}}>{u.av}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600}}>{u.name}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:1}}>{u.time}的修持</div>
                  </div>
                  <button onClick={()=>setLiked(p=>({...p,[u.id]:!p[u.id]}))}
                    style={{background:liked[u.id]?"rgba(240,192,64,.12)":"rgba(255,255,255,.04)",border:`1px solid ${liked[u.id]?"rgba(240,192,64,.35)":"rgba(255,255,255,.1)"}`,borderRadius:20,padding:"4px 10px",cursor:"pointer",fontSize:11,color:liked[u.id]?"#f0c040":"rgba(255,255,255,.35)",transition:"all .2s"}}>
                    🙏{liked[u.id]?"已赞":"随喜"}
                  </button>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {u.items.map((item,i)=>{
                    const p=getPractice(item.practiceId);
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:5,background:`${p.color}12`,border:`1px solid ${p.color}25`,borderRadius:20,padding:"4px 10px"}}>
                        <span style={{fontSize:13}}>{p.icon}</span>
                        <span style={{fontSize:12,color:p.color,fontWeight:600}}>{fmtN(item.count)}</span>
                        <span style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>{p.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,.2)",padding:"8px 0"}}>
              只显示善友的每日汇总动态
            </div>
          </div>
        )}

        {friendsSubTab==="ranking"&&(
          <div style={card()}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>🏆 善友排行榜</div>
            {LEADERBOARD.map(u=>{
              const total=Object.values(u.pts).reduce((a,b)=>a+b,0);
              return(
                <div key={u.rank} style={{display:"flex",alignItems:"center",gap:9,padding:9,borderRadius:10,marginBottom:4,background:u.isMe?"rgba(240,192,64,.06)":"transparent",border:u.isMe?"1px solid rgba(240,192,64,.15)":"1px solid transparent"}}>
                  <div style={{width:22,textAlign:"center",fontSize:u.rank<=3?17:12,color:u.rank===1?"#f0c040":u.rank===2?"#c0c0c0":u.rank===3?"#cd7f32":"rgba(255,255,255,.3)",fontWeight:700}}>
                    {u.rank<=3?["🥇","🥈","🥉"][u.rank-1]:u.rank}
                  </div>
                  <div style={{width:36,height:36,borderRadius:"50%",background:u.isMe?"rgba(240,192,64,.2)":"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:u.isMe?"#f0c040":"#e5dcc8",border:u.isMe?"2px solid rgba(240,192,64,.4)":"none",flexShrink:0}}>{u.av}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:u.isMe?700:500}}>{u.name} <span style={{fontSize:12}}>{u.badges.join("")}</span></div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:1}}>🔥{u.streak}天 · {fmtN(total)}</div>
                    <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                      {Object.entries(u.pts).slice(0,3).map(([pid,cnt])=>{
                        const pp=practices.find(p=>p.id===pid)||{icon:"☸️",color:"#f0c040",unit:""};
                        return <span key={pid} style={{fontSize:9,color:pp.color,background:`${pp.color}15`,borderRadius:8,padding:"1px 6px"}}>{pp.icon}{fmtN(cnt)}{pp.unit}</span>;
                      })}
                    </div>
                  </div>
                  <button onClick={()=>setLiked(p=>({...p,[u.rank+"r"]:!p[u.rank+"r"]}))}
                    style={{background:liked[u.rank+"r"]?"rgba(240,192,64,.12)":"rgba(255,255,255,.04)",border:`1px solid ${liked[u.rank+"r"]?"rgba(240,192,64,.35)":"rgba(255,255,255,.1)"}`,borderRadius:20,padding:"4px 9px",cursor:"pointer",fontSize:11,color:liked[u.rank+"r"]?"#f0c040":"rgba(255,255,255,.35)",transition:"all .2s"}}>
                    🙏{liked[u.rank+"r"]?"已赞":"随喜"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {friendsSubTab==="badges"&&(
          <div>
            {/* My badges */}
            <div style={card("rgba(240,192,64,.15)")}>
              <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:12}}>🎖 我的成就</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[
                  {i:"⭐",l:"百万行者",s:"累计>100万"},
                  {i:"🔥",l:`精进${streak}天`,s:"连续打卡"},
                  {i:"🌸",l:"法会参与",s:"参与共修"},
                  {i:"🙇",l:"礼拜行者",s:"礼拜>1000拜"},
                ].map(b=>(
                  <div key={b.i} style={{background:"rgba(240,192,64,.07)",border:"1px solid rgba(240,192,64,.18)",borderRadius:12,padding:"10px",textAlign:"center",minWidth:68}}>
                    <div style={{fontSize:22}}>{b.i}</div>
                    <div style={{fontSize:11,fontWeight:700,marginTop:4}}>{b.l}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2}}>{b.s}</div>
                  </div>
                ))}
                <div style={{background:"rgba(255,255,255,.02)",border:"1px dashed rgba(255,255,255,.1)",borderRadius:12,padding:"10px",textAlign:"center",minWidth:68,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.2)"}}>更多待解锁</div>
                </div>
              </div>
            </div>
            {/* Streak */}
            <div style={{...card("rgba(251,146,60,.2)"),background:"rgba(251,100,0,.05)"}}>
              <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",marginBottom:10}}>🔥 连续打卡</div>
              <div style={{display:"flex",gap:3}}>
                {Array.from({length:21}).map((_,i)=>(
                  <div key={i} style={{flex:1,height:26,borderRadius:4,background:i<(streak%21)?"linear-gradient(180deg,#ff7800,#f0c040)":"rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:i<(streak%21)?"#080c18":"rgba(255,255,255,.15)"}}>
                    {i<(streak%21)?"🔥":"·"}
                  </div>
                ))}
              </div>
              <div style={{marginTop:8,fontSize:13,color:"rgba(255,160,0,.9)",fontWeight:700}}>已连续 {streak} 天</div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // ── Settings Page ─────────────────────────────────────────────────────────────
  const SettingsPage = ()=>{
    const [draft, setDraft] = useState({...userProfile});
    const fs = fontScale;
    const AVATAR_OPTIONS = ["普","慧","觉","莲","净","法","明","空","圆","寂","定","悟","忍","智","仁","慈"];
    const FONT_SCALES = [
      {val:0.85, label:"小"},
      {val:1,    label:"中"},
      {val:1.2,  label:"大"},
      {val:1.45, label:"超大"},
    ];

    const sectionTitle = (t) => (
      <div style={{fontSize:10,letterSpacing:"0.18em",color:"rgba(240,192,64,.6)",marginBottom:8,marginTop:4}}>{t}</div>
    );
    const row = (label, child, last=false) => (
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:last?"none":"1px solid rgba(255,255,255,.05)"}}>
        <span style={{fontSize:Math.round(13*fs),color:"rgba(255,255,255,.7)"}}>{label}</span>
        {child}
      </div>
    );
    const Toggle = ({val, onChange}) => (
      <div onClick={()=>onChange(!val)}
        style={{width:44,height:26,borderRadius:13,background:val?"linear-gradient(135deg,#c9952a,#f0c040)":"rgba(255,255,255,.12)",position:"relative",cursor:"pointer",transition:"background .25s",flexShrink:0}}>
        <div style={{position:"absolute",top:3,left:val?21:3,width:20,height:20,borderRadius:"50%",background:"white",transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
      </div>
    );

    return(
      <div>
        {/* Back */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div onClick={()=>setShowSettings(false)}
            style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.6)",flexShrink:0}}>‹</div>
          <span style={{fontSize:Math.round(17*fs),fontWeight:700}}>设置</span>
        </div>

        {/* Avatar */}
        <div style={card("rgba(240,192,64,.15)")}>
          {sectionTitle("👤 个人信息")}
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(240,192,64,.2)",border:"2px solid rgba(240,192,64,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700,color:"#f0c040",flexShrink:0}}>
              {draft.avatar}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:Math.round(10*fs),color:"rgba(255,255,255,.4)",marginBottom:6}}>选择头像字</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {AVATAR_OPTIONS.map(a=>(
                  <div key={a} onClick={()=>setDraft(d=>({...d,avatar:a}))}
                    style={{width:28,height:28,borderRadius:"50%",background:draft.avatar===a?"rgba(240,192,64,.3)":"rgba(255,255,255,.07)",border:`1px solid ${draft.avatar===a?"rgba(240,192,64,.6)":"rgba(255,255,255,.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer",fontWeight:700,color:draft.avatar===a?"#f0c040":"rgba(255,255,255,.5)",transition:"all .15s"}}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:Math.round(10*fs),color:"rgba(255,255,255,.4)",marginBottom:6}}>法名 / 显示名称</div>
            <input style={{...inp,fontSize:Math.round(14*fs)}} placeholder="你的法名或昵称…"
              value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))}/>
          </div>
          <div>
            <div style={{fontSize:Math.round(10*fs),color:"rgba(255,255,255,.4)",marginBottom:6}}>个人简介（可选）</div>
            <input style={{...inp,fontSize:Math.round(14*fs)}} placeholder="一句话介绍自己…"
              value={draft.bio} onChange={e=>setDraft(d=>({...d,bio:e.target.value}))}/>
          </div>
        </div>

        {/* Font size */}
        <div style={card()}>
          {sectionTitle("🔤 字号大小")}
          <div style={{display:"flex",gap:6}}>
            {FONT_SCALES.map(f=>(
              <div key={f.val} onClick={()=>setFontScale(f.val)}
                style={{flex:1,padding:"10px 0",borderRadius:10,textAlign:"center",cursor:"pointer",background:fontScale===f.val?"rgba(240,192,64,.15)":"rgba(255,255,255,.04)",border:`1px solid ${fontScale===f.val?"rgba(240,192,64,.4)":"rgba(255,255,255,.08)"}`,transition:"all .2s"}}>
                <div style={{fontSize:Math.round(f.val*16),color:fontScale===f.val?"#f0c040":"rgba(255,255,255,.5)",fontWeight:fontScale===f.val?700:400}}>字</div>
                <div style={{fontSize:10,color:fontScale===f.val?"#f0c040":"rgba(255,255,255,.3)",marginTop:4}}>{f.label}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:Math.round(11*fs),color:"rgba(255,255,255,.25)",marginTop:10,textAlign:"center"}}>
            预览：{["小","中","大","超大"].find((_,i)=>[0.85,1,1.2,1.45][i]===fontScale)||"中"} · 当前字号 {Math.round(14*fontScale)}px
          </div>
        </div>

        {/* Privacy */}
        <div style={card()}>
          {sectionTitle("🔒 隐私设置")}
          {row("修持数据公开", <Toggle val={draft.dataPublic} onChange={v=>setDraft(d=>({...d,dataPublic:v}))}/>)}
          {row("出现在排行榜", <Toggle val={draft.inRanking} onChange={v=>setDraft(d=>({...d,inRanking:v}))}/>)}
          {row("允许陌生人发送好友申请", <Toggle val={draft.allowFriendReq} onChange={v=>setDraft(d=>({...d,allowFriendReq:v}))}/>, true)}
        </div>

        {/* Notifications */}
        <div style={card()}>
          {sectionTitle("🔔 通知设置")}
          {row("每日打卡提醒", <Toggle val={draft.notifyDaily} onChange={v=>setDraft(d=>({...d,notifyDaily:v}))}/>)}
          {row("共修活动通知", <Toggle val={draft.notifyRetreat} onChange={v=>setDraft(d=>({...d,notifyRetreat:v}))}/>)}
          {row("好友申请通知", <Toggle val={draft.notifyFriend} onChange={v=>setDraft(d=>({...d,notifyFriend:v}))}/>, true)}
        </div>

        {/* Account */}
        <div style={card()}>
          {sectionTitle("⚙️ 账号")}
          {row("数据导出", <span style={{fontSize:12,color:"rgba(255,255,255,.25)"}}>即将上线</span>)}
          {row("退出登录", <span style={{fontSize:12,color:"rgba(239,68,68,.6)"}}>退出</span>, true)}
        </div>

        {/* Save */}
        <button style={{...pbtn("p"),width:"100%",marginBottom:24}}
          onClick={()=>{ setUserProfile(draft); setShowSettings(false); }}>
          保存设置
        </button>
      </div>
    );
  };

  const tabMap={home:<HomeTab/>,stats:<StatsTab/>,retreats:<RetreatsTab/>,friends:<FriendsTab/>};
  const navItems=[{id:"home",icon:"☸",label:"首页"},{id:"stats",icon:"📊",label:"统计"},{id:"retreats",icon:"🏮",label:"共修"},{id:"friends",icon:"🌸",label:"善友"}];

  return(
    <div style={{fontFamily:"'Noto Serif SC','Source Han Serif SC',serif",background:"linear-gradient(160deg,#080c18,#0f1520 60%,#090d15)",minHeight:"100vh",color:"#e5dcc8",maxWidth:430,margin:"0 auto",position:"relative"}}>
      {/* Header */}
      <div style={{padding:"20px 18px 14px",borderBottom:"1px solid rgba(255,255,255,.07)",background:"rgba(5,8,16,.88)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex",alignItems:"baseline",gap:7}}>
              <span style={{fontSize:20}}>🪷</span>
              <span style={{fontSize:19,fontWeight:700,color:"#f0c040",letterSpacing:"0.06em"}}>无量</span>
              <span style={{fontSize:11,fontWeight:400,color:"rgba(240,192,64,.55)",letterSpacing:"0.18em"}}>Ananta</span>
            </div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.28)",letterSpacing:"0.12em",marginTop:2}}>BUDDHIST PRACTICE TRACKER</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,color:"rgba(240,192,64,.8)"}}>🔥 {streak} 天连续</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.28)",marginTop:1}}>{userProfile.name}</div>
            </div>
            <div onClick={()=>setShowSettings(s=>!s)}
              style={{width:38,height:38,borderRadius:"50%",background:showSettings?"rgba(240,192,64,.25)":"rgba(240,192,64,.12)",border:`2px solid ${showSettings?"rgba(240,192,64,.7)":"rgba(240,192,64,.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:"#f0c040",cursor:"pointer",transition:"all .2s",flexShrink:0}}>
              {userProfile.avatar}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"14px 14px 84px",fontSize:`${fontScale}em`}}>{showSettings ? <SettingsPage/> : tabMap[tab]}</div>

      {/* FAB — only on home tab */}
      {(tab==="home"||tab==="retreats")&&<button style={{position:"fixed",bottom:70,right:18,width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#c9952a,#f0c040)",border:"none",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 18px rgba(240,192,64,.45)",zIndex:150,color:"#080c18",transition:"transform .2s"}}
        onClick={()=>setShowLog(true)}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>＋</button>}

      {/* ── Create Retreat Sheet ── */}
      <Sheet show={showCreateR} onClose={()=>setShowCreateR(false)} title="🏮 发起共修">
        <div style={label}>共修名称</div>
        <input style={{...inp,marginBottom:12}} placeholder="如：清明观音共修、药师法会…"
          value={editR.name} onChange={e=>setEditR(r=>({...r,name:e.target.value}))}/>
        <div style={label}>简介（可选）</div>
        <input style={{...inp,marginBottom:12}} placeholder="共修的发心与说明…"
          value={editR.desc} onChange={e=>setEditR(r=>({...r,desc:e.target.value}))}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <div style={label}>开始日期</div>
            <input style={inp} type="date" value={editR.start} onChange={e=>setEditR(r=>({...r,start:e.target.value}))}/>
          </div>
          <div>
            <div style={label}>结束日期</div>
            <input style={inp} type="date" value={editR.end} onChange={e=>setEditR(r=>({...r,end:e.target.value}))}/>
          </div>
        </div>
        {/* Course items */}
        <div style={label}>课目与建议数量</div>
        {editR.items.map((it,i)=>{
          const p=getPractice(it.practiceId);
          return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{fontSize:18,flexShrink:0}}>{p.icon}</div>
              <div style={{fontSize:12,color:p.color,flex:1}}>{p.name}</div>
              <input style={{...inp,width:100,flexShrink:0,padding:"8px 10px",fontSize:13}} type="number"
                placeholder={`建议${p.unit}数`}
                value={it.suggestedGoal||""}
                onChange={e=>setEditR(r=>({...r,items:r.items.map((x,j)=>j===i?{...x,suggestedGoal:parseInt(e.target.value)||0}:x)}))}/>
              <div style={{cursor:"pointer",color:"rgba(255,100,100,.5)",fontSize:18,flexShrink:0}}
                onClick={()=>setEditR(r=>({...r,items:r.items.filter((_,j)=>j!==i)}))}>×</div>
            </div>
          );
        })}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {practices.filter(p=>!editR.items.find(it=>it.practiceId===p.id)).map(p=>(
            <div key={p.id} style={pill(false,p.color)}
              onClick={()=>setEditR(r=>({...r,items:[...r.items,{practiceId:p.id,suggestedGoal:0}]}))}>
              {p.icon} {p.name}
            </div>
          ))}
        </div>
        {/* Settings */}
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <div style={pill(editR.openJoin,"#60a5fa")} onClick={()=>setEditR(r=>({...r,openJoin:true}))}>开放加入</div>
          <div style={pill(!editR.openJoin,"#60a5fa")} onClick={()=>setEditR(r=>({...r,openJoin:false}))}>需要审核</div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          <div style={pill(editR.autoEnd,"#a78bfa")} onClick={()=>setEditR(r=>({...r,autoEnd:true}))}>到期自动结束</div>
          <div style={pill(!editR.autoEnd,"#a78bfa")} onClick={()=>setEditR(r=>({...r,autoEnd:false}))}>手动结束</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={pbtn("s")} onClick={()=>setShowCreateR(false)}>取消</button>
          <button style={pbtn("p")} onClick={handleCreateRetreat}>发起共修 🏮</button>
        </div>
      </Sheet>

      {/* ── Join Retreat Sheet ── */}
      {showJoinR&&(()=>{
        const r=retreats.find(x=>x.id===showJoinR);
        if(!r) return null;
        return(
          <Sheet show={true} onClose={()=>setShowJoinR(null)} title="🙏 加入共修">
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{r.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:16}}>{r.start} ~ {r.end}</div>
            <div style={label}>设定各课目目标数量</div>
            {r.items.map(it=>{
              const p=getPractice(it.practiceId);
              return(
                <div key={it.practiceId} style={{marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <span style={{fontSize:16}}>{p.icon}</span>
                    <span style={{fontSize:13,color:p.color,fontWeight:600}}>{p.name}</span>
                    {it.suggestedGoal>0&&<span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>建议：{fmtN(it.suggestedGoal)} {p.unit}</span>}
                  </div>
                  <input style={inp} type="number"
                    placeholder={`我的目标 ${p.unit} 数（必填）`}
                    value={joinGoals[it.practiceId]||""}
                    onChange={e=>setJoinGoals(g=>({...g,[it.practiceId]:e.target.value}))}/>
                </div>
              );
            })}
            <div style={{fontSize:11,color:"rgba(255,255,255,.25)",marginBottom:16,lineHeight:1.6}}>
              加入后将自动为每个课目创建对应的个人发愿，发愿名称格式为「共修名 · 课目名」。
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={pbtn("s")} onClick={()=>setShowJoinR(null)}>取消</button>
              <button style={{...pbtn("p"),opacity:r.items.every(it=>joinGoals[it.practiceId])?1:.4}}
                onClick={()=>{ if(r.items.every(it=>joinGoals[it.practiceId])) handleJoinRetreat(showJoinR); }}>
                确认加入 🙏
              </button>
            </div>
          </Sheet>
        );
      })()}

      {/* ── Share Retreat Sheet ── */}
      {shareRid&&(()=>{
        const r=retreats.find(x=>x.id===shareRid);
        if(!r) return null;
        const fakeUrl=`https://gongxiu.app/r/${shareRid}`;
        return(
          <Sheet show={true} onClose={()=>setShareRid(null)} title="📤 分享共修">
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{r.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:20}}>{r.start} ~ {r.end}</div>
            {/* QR code placeholder */}
            <div style={{width:160,height:160,margin:"0 auto 20px",background:"white",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6}}>
              <div style={{fontSize:10,color:"#333",textAlign:"center",padding:"0 12px"}}>
                <div style={{fontSize:32,marginBottom:4}}>📱</div>
                <div>扫码加入共修</div>
                <div style={{fontSize:9,color:"#888",marginTop:4}}>{r.name}</div>
              </div>
            </div>
            {/* URL */}
            <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 12px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,fontSize:11,color:"rgba(255,255,255,.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fakeUrl}</div>
              <button style={{...pbtn("s"),flex:"none",padding:"6px 12px",fontSize:11}}
                onClick={()=>navigator.clipboard?.writeText(fakeUrl)}> 复制</button>
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.25)",textAlign:"center",marginBottom:16}}>
              {r.openJoin?"扫码后可直接加入":"扫码后需发起人审核"}
            </div>
            <button style={{...pbtn("s"),width:"100%"}} onClick={()=>setShareRid(null)}>关闭</button>
          </Sheet>
        );
      })()}

      {/* ── Log Sheet ── */}
      <Sheet show={showLog} onClose={()=>setShowLog(false)} title="🪷 记录功课">
        <div style={label}>课目</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {practices.map(p=>(
            <div key={p.id} style={pill(logPid===p.id,p.color)} onClick={()=>{setLogPid(p.id);setLogCid(null);}}>
              {p.icon} {p.name}
            </div>
          ))}
        </div>
        <div style={label}>数量（{getPractice(logPid).unit}）</div>
        <input style={{...inp,marginBottom:12}} type="number"
          placeholder={`本次 ${getPractice(logPid).unit} 数…`}
          value={logN} onChange={e=>setLogN(e.target.value)}/>
        <div style={label}>备注（可选）</div>
        <input style={{...inp,marginBottom:14}} type="text"
          placeholder="晨课、法会、随缘念诵…"
          value={logNote} onChange={e=>setLogNote(e.target.value)}/>
        {availCampaigns.length>0&&(<>
          <div style={label}>
            计入发愿
            <span style={{color:"rgba(255,255,255,.22)",marginLeft:6,fontWeight:400}}>（不选则仅累入日常总数）</span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            <div style={pill(logCid===null,"#888")} onClick={()=>setLogCid(null)}>仅日常累积</div>
            {availCampaigns.map(c=>{
              const p=getPractice(c.practiceId);
              return <div key={c.id} style={pill(logCid===c.id,p.color)} onClick={()=>setLogCid(c.id)}>🏮 {c.name}</div>;
            })}
          </div>
        </>)}
        <div style={{display:"flex",gap:8}}>
          <button style={pbtn("s")} onClick={()=>setShowLog(false)}>取消</button>
          <button style={pbtn("p")} onClick={handleLog}>🙏 记录</button>
        </div>
      </Sheet>

      {/* ── Practice Edit Sheet ── */}
      <Sheet show={!!practiceSheet} onClose={()=>setPracticeSheet(null)}
        title={practiceSheet?.mode==="new"?"新建课目":"编辑课目"}>
        <div style={label}>名称</div>
        <input style={{...inp,marginBottom:14}} placeholder="如：大悲咒、心经…"
          value={editP.name} onChange={e=>setEditP(p=>({...p,name:e.target.value}))}/>
        <div style={label}>单位</div>
        <input style={{...inp,marginBottom:14}} placeholder="遍、部、拜、盏…"
          value={editP.unit} onChange={e=>setEditP(p=>({...p,unit:e.target.value}))}/>
        <div style={label}>图标</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          {ICON_OPTIONS.map(ic=>(
            <div key={ic} style={{width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",background:editP.icon===ic?"rgba(240,192,64,.2)":"rgba(255,255,255,.05)",border:`1px solid ${editP.icon===ic?"rgba(240,192,64,.5)":"rgba(255,255,255,.08)"}`,transition:"all .15s"}}
              onClick={()=>setEditP(p=>({...p,icon:ic}))}>{ic}</div>
          ))}
        </div>
        <div style={label}>颜色</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {COLOR_OPTIONS.map(c=>(
            <div key={c} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:`3px solid ${editP.color===c?"#fff":"transparent"}`,transition:"border .15s"}}
              onClick={()=>setEditP(p=>({...p,color:c}))}/>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom: practiceSheet?.mode==="edit"?12:0}}>
          <button style={pbtn("s")} onClick={()=>setPracticeSheet(null)}>取消</button>
          <button style={pbtn("p")} onClick={savePractice}>保存</button>
        </div>
        {practiceSheet?.mode==="edit"&&(
          <button style={{...pbtn("s"),width:"100%",color:"#ef4444",borderColor:"rgba(239,68,68,.3)"}}
            onClick={()=>deletePractice(practiceSheet.id)}>删除此课目…</button>
        )}
      </Sheet>

      {/* ── Campaign Edit Sheet ── */}
      <Sheet show={!!campaignSheet} onClose={()=>setCampaignSheet(null)}
        title={campaignSheet?.mode==="new"?"新建发愿":"编辑发愿"}>
        <div style={label}>发愿名称</div>
        <input style={{...inp,marginBottom:14}} placeholder="如：春季法会共修、百日礼拜…"
          value={editC.name} onChange={e=>setEditC(c=>({...c,name:e.target.value}))}/>
        <div style={label}>所属课目</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {practices.map(p=>(
            <div key={p.id} style={pill(editC.practiceId===p.id,p.color)}
              onClick={()=>setEditC(c=>({...c,practiceId:p.id}))}>
              {p.icon} {p.name}
            </div>
          ))}
        </div>
        <div style={label}>目标数量（{getPractice(editC.practiceId).unit}）</div>
        <input style={{...inp,marginBottom:14}} type="number" placeholder="如：1000000"
          value={editC.goal} onChange={e=>setEditC(c=>({...c,goal:e.target.value}))}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <div style={label}>开始日期</div>
            <input style={inp} type="date" value={editC.start} onChange={e=>setEditC(c=>({...c,start:e.target.value}))}/>
          </div>
          <div>
            <div style={label}>截止日期</div>
            <input style={inp} type="date" value={editC.end} onChange={e=>setEditC(c=>({...c,end:e.target.value}))}/>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:campaignSheet?.mode==="edit"?12:0}}>
          <button style={pbtn("s")} onClick={()=>setCampaignSheet(null)}>取消</button>
          <button style={pbtn("p")} onClick={saveCampaign}>保存</button>
        </div>
        {campaignSheet?.mode==="edit"&&(<>
          <button style={{...pbtn("s"),width:"100%",marginBottom:8,color:"#4ade80",borderColor:"rgba(74,222,128,.3)"}}
            onClick={()=>{ markCampaignDone(campaignSheet.id); setCampaignSheet(null); }}>标记为圆满 ✓</button>
          <button style={{...pbtn("s"),width:"100%",color:"#ef4444"}}
            onClick={()=>deleteCampaign(campaignSheet.id)}>删除此发愿…</button>
        </>)}
      </Sheet>

      {/* Confirm dialog */}
      <Confirm show={!!confirm} message={confirm?.message}
        onOk={confirm?.onOk} onCancel={()=>setConfirm(null)}/>

      {/* Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(7,10,20,.97)",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-around",padding:"9px 0 14px",backdropFilter:"blur(20px)",zIndex:200}}>
        {navItems.map(n=>(
          <div key={n.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",color:tab===n.id?"#f0c040":"rgba(255,255,255,.3)",fontSize:10,letterSpacing:"0.04em",userSelect:"none",transition:"color .2s"}} onClick={()=>setTab(n.id)}>
            <span style={{fontSize:19}}>{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
