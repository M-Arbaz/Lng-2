'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, Loader2, Megaphone,
  X, Eye, EyeOff, Palette, CalendarDays,
  MonitorPlay, Type, ChevronDown,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import announcementService from '../utils/announcementService.js'

const DEFAULT_COLORS = [
  '#5A2D0C','#FFD400','#FAFAF8','#ffffff','#E53935','#7A4A20','#1F1F1F','#22C55E',
  '#2563eb','#9333ea','#db2777','#0891b2','#4b5563','#9ca3af',
]

function fmtDT(v){ if(!v) return ''; const d=new Date(v),p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}` }

function PreviewBar({data}){
  const bg=data.bgColor||'#5A2D0C', tc=data.textColor||'#ffffff', mq=data.displayStyle==='marquee'
  return (
    <div className="w-full rounded-lg overflow-hidden" style={{backgroundColor:bg,color:tc}}>
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm">
        {mq?(
          <div className="overflow-hidden w-full"><div className="whitespace-nowrap animate-marquee">
            <span className="inline-block px-4" dangerouslySetInnerHTML={{__html:data.message}} />
            <span className="inline-block px-4" dangerouslySetInnerHTML={{__html:data.message}} />
            <span className="inline-block px-4" dangerouslySetInnerHTML={{__html:data.message}} />
          </div></div>
        ):(
          <span className="font-medium" dangerouslySetInnerHTML={{__html:data.message}} />
        )}
      </div>
    </div>
  )
}

function emptyForm(){ return { message:'', isActive:true, displayStyle:'static', bgColor:'#5A2D0C', textColor:'#ffffff', scrollSpeed:20, startDate:'', endDate:'' } }

export default function AdminAnnouncementsPage(){
  const [announcements,setAnnouncements]=useState([])
  const [loading,setLoading]=useState(true)
  const [searchQuery,setSearchQuery]=useState('')
  const [showForm,setShowForm]=useState(false)
  const [editingId,setEditingId]=useState(null)
  const [msg,setMsg]=useState({type:'',text:''})
  const [saving,setSaving]=useState(false)
  const [barEnabled,setBarEnabled]=useState(true)
  const [barLoading,setBarLoading]=useState(false)
  const [previewOpen,setPreviewOpen]=useState(false)
  const [form,setForm]=useState(emptyForm())

  useEffect(()=>{
    (async()=>{
      try{ setLoading(true); const [data,en]=await Promise.all([announcementService.getAllAnnouncements(),announcementService.getAnnouncementBarEnabled()]); setAnnouncements(data); setBarEnabled(en) }
      catch(e){ console.error(e); setMsg({type:'error',text:'Failed to load announcements'}) }
      finally{ setLoading(false) }
    })()
  },[])

  const onChange=(e)=>{ const{name,value,type,checked}=e.target; setForm(p=>({...p,[name]:type==='checkbox'?checked:type==='number'?Number(value):value})) }

  const onSubmit=async(e)=>{
    e.preventDefault(); if(!form.message.trim()){ setMsg({type:'error',text:'Please enter an announcement message'}); return }
    setSaving(true)
    try{
      const payload={ message:form.message.trim(), isActive:form.isActive, displayStyle:form.displayStyle, bgColor:form.bgColor, textColor:form.textColor, scrollSpeed:Number(form.scrollSpeed)||20, startDate:form.startDate||null, endDate:form.endDate||null }
      if(editingId){ await announcementService.updateAnnouncement(editingId,payload); setAnnouncements(p=>p.map(a=>a.id===editingId?{...a,...payload,updatedAt:new Date().toISOString()}:a).sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0))); setMsg({type:'success',text:'Announcement updated!'}); setEditingId(null) }
      else { const n=await announcementService.createAnnouncement(payload); setAnnouncements(p=>[...p,n].sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0))); setMsg({type:'success',text:'Announcement created!'}) }
      resetForm()
    }catch(err){ console.error(err); setMsg({type:'error',text:'Failed to save announcement.'}) }
    finally{ setSaving(false); setTimeout(()=>setMsg({type:'',text:''}),3000) }
  }

  const resetForm=()=>{ setForm(emptyForm()); setShowForm(false); setEditingId(null); setPreviewOpen(false) }

  const onEdit=(a)=>{ setForm({ message:a.message||'', isActive:a.isActive!==false, displayStyle:a.displayStyle||'static', bgColor:a.bgColor||'#5A2D0C', textColor:a.textColor||'#ffffff', scrollSpeed:a.scrollSpeed||20, startDate:fmtDT(a.startDate), endDate:fmtDT(a.endDate) }); setEditingId(a.id); setShowForm(true) }

  const onDelete=async(id)=>{ if(!window.confirm('Delete this announcement?')) return; try{ await announcementService.deleteAnnouncement(id); setAnnouncements(p=>p.filter(a=>a.id!==id)); setMsg({type:'success',text:'Deleted!'}) }catch(err){ console.error(err); setMsg({type:'error',text:'Failed to delete.'}) } setTimeout(()=>setMsg({type:'',text:''}),3000) }

  const onToggleActive=async(a)=>{ try{ const upd={...a,isActive:!a.isActive}; await announcementService.updateAnnouncement(a.id,upd); setAnnouncements(p=>p.map(x=>x.id===a.id?{...x,isActive:!x.isActive}:x)); setMsg({type:'success',text:`Announcement ${upd.isActive?'activated':'deactivated'}.`}) }catch(err){ console.error(err); setMsg({type:'error',text:'Failed to update status.'}) } setTimeout(()=>setMsg({type:'',text:''}),3000) }

  const toggleBar=async()=>{ setBarLoading(true); try{ const n=!barEnabled; await announcementService.setAnnouncementBarEnabled(n); setBarEnabled(n); setMsg({type:'success',text:`Bar ${n?'enabled':'disabled'}.`}) }catch(err){ console.error(err); setMsg({type:'error',text:'Failed to update bar setting.'}) } setBarLoading(false); setTimeout(()=>setMsg({type:'',text:''}),3000) }

  const filtered=announcements.filter(a=>{ const q=searchQuery.toLowerCase(); return a.message?.toLowerCase().includes(q) })

  return (
    <AdminLayout>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} .animate-marquee{animation:marquee 20s linear infinite}`}</style>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Announcement Bar</h2>
          <div className="flex items-center gap-3">
            <button onClick={toggleBar} disabled={barLoading} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition ${barEnabled?'bg-green-50 border-green-200 text-green-700 hover:bg-green-100':'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
              {barEnabled?<Eye className="w-4 h-4" />:<EyeOff className="w-4 h-4" />}
              {barEnabled?'Bar Enabled':'Bar Disabled'}
            </button>
            <button onClick={()=>{resetForm();setShowForm(true)}} className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105">
              <Plus className="w-5 h-5" /> Add Announcement
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {msg.text&&(<div className={`p-4 rounded-lg flex items-center gap-3 ${msg.type==='success'?'bg-green-50 border border-green-200':'bg-red-50 border border-red-200'}`}>
          {msg.type==='success'?<CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />:<AlertCircle className="w-5 h-5 text-[#E53935] flex-shrink-0" />}
          <p className={`font-medium ${msg.type==='success'?'text-green-800':'text-red-800'}`}>{msg.text}</p>
        </div>)}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search announcements..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white" />
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <MonitorPlay className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Only announcements within their scheduled window are visible</p>
            <p className="text-xs text-blue-600 mt-1">Active announcements will loop continuously on the website.</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {loading?(
            <div className="p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /><span className="ml-3 text-gray-600">Loading announcements...</span></div>
          ):filtered.length===0?(
            <div className="p-12 text-center"><Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg font-medium">No announcements found</p><p className="text-gray-400 text-sm mt-1">{searchQuery?'Try adjusting your search.':'Create your first announcement to get started.'}</p></div>
          ):(
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Message & Style</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-28">Schedule</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-24">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 w-40">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((a)=>{
                    const scheduled=a.startDate||a.endDate
                    return (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{backgroundColor:a.bgColor||'#5A2D0C',color:a.textColor||'#ffffff'}}>{a.displayStyle==='marquee'?'Marquee':'Static'}</span>
                          </div>
                          <p className="text-sm text-gray-800 font-medium line-clamp-2" dangerouslySetInnerHTML={{__html:a.message}} />
                          <p className="text-xs text-gray-400 mt-1">{a.createdAt?new Date(a.createdAt).toLocaleString():''}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {scheduled?(
                            <div className="text-xs text-gray-600 space-y-0.5">
                              {a.startDate&&<div className="flex items-center gap-1 justify-center"><CalendarDays className="w-3 h-3 text-gray-400" /><span>From {new Date(a.startDate).toLocaleDateString()}</span></div>}
                              {a.endDate&&<div className="flex items-center gap-1 justify-center"><CalendarDays className="w-3 h-3 text-gray-400" /><span>Until {new Date(a.endDate).toLocaleDateString()}</span></div>}
                            </div>
                          ):(<span className="text-xs text-gray-400">Always</span>)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button onClick={()=>onToggleActive(a)} className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition ${a.isActive!==false?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                            {a.isActive!==false?(<><Eye className="w-3 h-3" /> Active</>):(<><EyeOff className="w-3 h-3" /> Inactive</>)}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={()=>{onEdit(a);setPreviewOpen(true)}} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Preview"><Eye className="w-4 h-4" /></button>
                            <button onClick={()=>onEdit(a)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={()=>onDelete(a.id)} className="p-2 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingId?'Edit Announcement':'Create Announcement'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-5">
              {/* Preview */}
              {form.message&&(
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1"><MonitorPlay className="w-3 h-3" /> Preview</label>
                    <button type="button" onClick={()=>setPreviewOpen(!previewOpen)} className="text-xs text-orange-600 font-medium flex items-center gap-1">{previewOpen?'Hide':'Show'} <ChevronDown className={`w-3 h-3 transition-transform ${previewOpen?'rotate-180':''}`} /></button>
                  </div>
                  {previewOpen&&<PreviewBar data={form} />}
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Type className="w-4 h-4 text-gray-400" /> Announcement Message *</label>
                <textarea name="message" value={form.message} onChange={onChange} placeholder="e.g., Free Shipping on Orders Above 10,000. <a href='/shipping-policy' style='text-decoration:underline'>Learn more</a>" rows={3} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none" />
                <p className="mt-1.5 text-xs text-gray-400">Tip: You can add clickable links using HTML tags. Example: &lt;a href="/shipping-policy"&gt;Learn more&lt;/a&gt;</p>
              </div>

              {/* Display Style & Speed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Style</label>
                  <select name="displayStyle" value={form.displayStyle} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                    <option value="static">Static</option>
                    <option value="marquee">Scrolling (Marquee)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scroll Speed (seconds) {form.displayStyle === 'marquee' && `(${form.scrollSpeed}s)`}</label>
                  <input type="number" name="scrollSpeed" value={form.scrollSpeed} onChange={onChange} min={5} max={60} step={1} disabled={form.displayStyle !== 'marquee'} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">5-60 seconds (lower = faster)</p>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Palette className="w-4 h-4 text-gray-400" /> Colors</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Background</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input type="color" name="bgColor" value={form.bgColor} onChange={onChange} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                      {DEFAULT_COLORS.map(c=><button key={c} type="button" onClick={()=>setForm(p=>({...p,bgColor:c}))} className="w-6 h-6 rounded-full border border-gray-200" style={{backgroundColor:c}} />)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Text</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input type="color" name="textColor" value={form.textColor} onChange={onChange} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                      {DEFAULT_COLORS.map(c=><button key={c} type="button" onClick={()=>setForm(p=>({...p,textColor:c}))} className="w-6 h-6 rounded-full border border-gray-200" style={{backgroundColor:c}} />)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1"><CalendarDays className="w-4 h-4 text-gray-400" /> Schedule (optional)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Start Date/Time</span>
                    <input type="datetime-local" name="startDate" value={form.startDate} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">End Date/Time</span>
                    <input type="datetime-local" name="endDate" value={form.endDate} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                  </div>
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={onChange} className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (show on website)</label>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving&&<Loader2 className="w-4 h-4 animate-spin" />}{saving?'Saving...':editingId?'Update':'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
