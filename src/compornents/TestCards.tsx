"use client"

import React, { useEffect, useState, DragEvent, useRef } from "react";
import {
    Box,
    Card,
    CardActionArea,
    Button,
    Grid,
    Typography,
    Dialog,
    DialogTitle,
    Chip,
    DialogContent,
    DialogActions,
    DialogContentText,
    CircularProgress,
    TextField,
    Menu,
    MenuItem,
    Checkbox,
} from "@mui/material";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from '@mui/icons-material/Folder';
import { useRouter } from "next/navigation";
import { Test } from "@prisma/client";
import { removeTest } from "@/app/api/test/removeTest";

import { msg } from "@/msg-ja";

interface DeleteTestButtonProps {
    testId: number;
    testTitle: string;
    onSuccess?: () => void;
}

const DeleteTestButton = ({ testId, testTitle, onSuccess }: DeleteTestButtonProps) => {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => { if (!isDeleting) setOpen(false); };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await removeTest({ id: testId });
            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            alert("削除に失敗しました。");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Button size="small" color="error" onClick={handleOpen}>
                {msg.DELETE_ACTION}
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>テストの削除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        「{testTitle}」を削除してもよろしいですか？この操作は取り消せません。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={isDeleting}>{msg.CANCEL}</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting} startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}>
                        {msg.DELETE_ACTION}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

interface props {
    testData: Test[]
}

const TestCardItem = ({ testData, onDeleted }: { testData: Test, onDeleted: (id: number) => void }) => {
    const router = useRouter();
    const solveButtonFunction = () => router.push("/solve/" + testData.id);
    const gradingTestButtonFunction = () => router.push("/teacher/grading/" + testData.id);
    const editTestButtonFunction = () => router.push("/teacher/createTest?testId=" + testData.id);

    return (
        <Card sx={{ height: "100%", display: 'flex', flexDirection: 'column', textAlign: "left" }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Grid container alignItems="center" spacing={1} mb={1} ml={3}>
                    <Grid size="grow">
                        <Typography variant="h6" component="div" sx={{ wordBreak: 'break-word', lineHeight: 1.2 }}>
                            {testData.title}
                        </Typography>
                    </Grid>
                    <Grid>
                        <Chip
                            label={testData.isPublished ? msg.PUBLISHED : msg.UNPUBLISHED}
                            color={testData.isPublished ? "success" : "default"}
                            size="small"
                            sx={{ fontWeight: 'normal' }}
                        />
                    </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: '3em' }}>{testData.summary}</Typography>
                <Typography variant="caption" display="block" color="text.secondary">{msg.START + " : " + testData.startDate.toLocaleString()}</Typography>
                <Typography variant="caption" display="block" color="text.secondary">{msg.END + " : " + testData.endDate.toLocaleString()}</Typography>
            </CardContent>
            <CardActions sx={{ flexWrap: 'wrap' }}>
                <Button size="small" onClick={solveButtonFunction}>{msg.SOLVE}</Button>
                <Button size="small" onClick={gradingTestButtonFunction}>{msg.GRADING}</Button>
                <Button size="small" onClick={editTestButtonFunction}>{msg.EDIT}</Button>
                <DeleteTestButton testId={testData.id} testTitle={testData.title} onSuccess={() => onDeleted(testData.id)} />
            </CardActions>
        </Card>
    );
}

const LOCAL_STORAGE_KEY = 'test_layout_prefs';

type LayoutNode = {
    id: string;
    type: 'item' | 'folder';
    parentId: string | null;
    order: number;
    name?: string;
    color?: string;
};

export function TestCards({ testData }: props) {
    const [tests, setTests] = useState<Test[]>(testData);
    const [layout, setLayout] = useState<LayoutNode[]>([]);
    const [isClient, setIsClient] = useState(false);

    // 複数選択用ステート
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [draggedId, setDraggedId] = useState<string | null>(null);

    const [bgContextMenu, setBgContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [folderContextMenu, setFolderContextMenu] = useState<{ mouseX: number; mouseY: number; folderId: string } | null>(null);
    
    const [openFolderId, setOpenFolderId] = useState<string | null>(null);
    
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
    const [editFolderName, setEditFolderName] = useState('');

    const [colorFolderId, setColorFolderId] = useState<string | null>(null);
    const [editFolderColor, setEditFolderColor] = useState('#1976d2');
    const colorInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let parsed: LayoutNode[] = saved ? JSON.parse(saved) : [];

        const existingItemIds = new Set(parsed.filter(n => n.type === 'item').map(n => Number(n.id)));
        let maxOrder = parsed.length > 0 ? Math.max(...parsed.filter(n => n.parentId === null).map(n => n.order), 0) : 0;

        const newNodes: LayoutNode[] = [];
        testData.forEach(t => {
            if (!existingItemIds.has(t.id)) {
                maxOrder++;
                newNodes.push({ id: t.id.toString(), type: 'item', parentId: null, order: maxOrder });
            }
        });

        const currentTestIds = new Set(testData.map(t => t.id.toString()));
        parsed = parsed.filter(n => n.type === 'folder' || currentTestIds.has(n.id));

        const finalLayout = [...parsed, ...newNodes];
        setLayout(finalLayout);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalLayout));
        setTests(testData);
    }, [testData]);

    // 範囲選択イベント処理
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // 左クリックのみ
        setIsSelecting(true);
        setSelectionBox({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
        setSelectedIds([]);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isSelecting) return;
            setSelectionBox(prev => ({ ...prev, endX: e.clientX, endY: e.clientY }));

            const left = Math.min(selectionBox.startX, e.clientX);
            const right = Math.max(selectionBox.startX, e.clientX);
            const top = Math.min(selectionBox.startY, e.clientY);
            const bottom = Math.max(selectionBox.startY, e.clientY);

            const newSelected: string[] = [];
            document.querySelectorAll('.draggable-item').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (!(rect.right < left || rect.left > right || rect.bottom < top || rect.top > bottom)) {
                    const id = el.getAttribute('data-id');
                    if (id) newSelected.push(id);
                }
            });
            setSelectedIds(newSelected);
        };

        const handleMouseUp = () => setIsSelecting(false);

        if (isSelecting) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isSelecting, selectionBox.startX, selectionBox.startY]);

    const handleBgContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setBgContextMenu(bgContextMenu === null ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 } : null);
    };

    const handleFolderContextMenu = (event: React.MouseEvent, folderId: string) => {
        event.preventDefault();
        event.stopPropagation();
        setFolderContextMenu(folderContextMenu === null ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6, folderId } : null);
    };

    const handleCloseContextMenus = () => {
        setBgContextMenu(null);
        setFolderContextMenu(null);
    };

    const handleOpenFolderDialogFromMenu = () => {
        setFolderDialogOpen(true);
        handleCloseContextMenus();
    };

    const handleOpenRenameDialog = () => {
        if (!folderContextMenu) return;
        const folder = layout.find(n => n.id === folderContextMenu.folderId);
        if (folder) {
            setEditFolderName(folder.name || '');
            setRenameFolderId(folder.id);
            setRenameDialogOpen(true);
        }
        handleCloseContextMenus();
    };

    const handleTriggerColorPicker = () => {
        if (!folderContextMenu) return;
        const folder = layout.find(n => n.id === folderContextMenu.folderId);
        if (folder) {
            setEditFolderColor(folder.color || '#1976d2');
            setColorFolderId(folder.id);
            setTimeout(() => { if (colorInputRef.current) colorInputRef.current.click(); }, 0);
        }
        handleCloseContextMenus();
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setEditFolderColor(newColor);
        if (!colorFolderId) return;
        setLayout(prev => {
            const newLayout = prev.map(n => n.id === colorFolderId ? { ...n, color: newColor } : n);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        const newFolder: LayoutNode = { id: 'folder-' + Date.now(), type: 'folder', parentId: null, order: layout.filter(n => n.parentId === null).length, name: newFolderName.trim() };
        const newLayout = [...layout, newFolder];
        setLayout(newLayout);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
        setFolderDialogOpen(false);
        setNewFolderName('');
    };

    const handleRenameFolder = () => {
        if (!renameFolderId || !editFolderName.trim()) return;
        setLayout(prev => {
            const newLayout = prev.map(n => n.id === renameFolderId ? { ...n, name: editFolderName.trim() } : n);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        setRenameDialogOpen(false);
        setRenameFolderId(null);
    };

    const handleDeleteFolderMenu = () => {
        if (!folderContextMenu) return;
        const folderId = folderContextMenu.folderId;
        handleCloseContextMenus();
        if (!window.confirm(msg.DELETE_FOLDER_CONFIRM || "フォルダを削除しますか？（中身のアイテムは外に移動されます）")) return;
        setLayout(prev => {
            const newLayout = prev.filter(n => n.id !== folderId).map(n => n.parentId === folderId ? { ...n, parentId: null } : n);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        if (openFolderId === folderId) setOpenFolderId(null);
    };

    const handleRemoveFromState = (deletedId: number) => {
        setTests((prev) => prev.filter((t) => t.id !== deletedId));
        setLayout(prev => {
            const newLayout = prev.filter(n => n.id !== deletedId.toString());
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
    };

    // --- Drag & Drop (Multi-select supported) ---
    const handleDragStart = (e: DragEvent, id: string) => {
        e.stopPropagation();
        setDraggedId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = "move";
        
        // 掴んだものが選択されていない場合、それのみを選択状態にする
        if (!selectedIds.includes(id)) {
            setSelectedIds([id]);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const getMovingIds = (fallbackId: string | null) => {
        if (!fallbackId) return [];
        return selectedIds.includes(fallbackId) ? selectedIds : [fallbackId];
    };

    const executeDrop = (targetParentId: string | null, insertBeforeNodeId: string | null = null) => {
        const movingIds = getMovingIds(draggedId);
        if (movingIds.length === 0) return;
        
        // フォルダをフォルダの中に入れようとしている場合はブロック
        if (targetParentId !== null) {
            const hasFolder = layout.some(n => movingIds.includes(n.id) && n.type === 'folder');
            if (hasFolder) return;
            if (movingIds.includes(targetParentId)) return; // 自身へのドロップ防止
        }

        setLayout(prev => {
            const newLayout = [...prev];
            const movingNodes = newLayout.filter(n => movingIds.includes(n.id));
            
            movingNodes.forEach(n => n.parentId = targetParentId);
            
            const siblings = newLayout.filter(n => n.parentId === targetParentId && !movingIds.includes(n.id)).sort((a, b) => a.order - b.order);
            const targetIndex = insertBeforeNodeId ? siblings.findIndex(n => n.id === insertBeforeNodeId) : siblings.length;
            const insertIndex = targetIndex !== -1 ? targetIndex : siblings.length;

            siblings.splice(insertIndex, 0, ...movingNodes);
            siblings.forEach((sib, idx) => sib.order = idx);

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        setDraggedId(null);
    };

    const handleDropOnItem = (e: DragEvent, targetId: string) => {
        e.preventDefault();
        e.stopPropagation();
        executeDrop(layout.find(n => n.id === targetId)?.parentId || null, targetId);
    };

    const handleDropOnFolder = (e: DragEvent, targetFolderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        // フォルダに重なった場合は中へ
        executeDrop(targetFolderId, null);
    };

    const handleDropOnRoot = (e: DragEvent) => {
        e.preventDefault();
        executeDrop(null, null);
    };

    // Ctrl + クリックでの複数選択ハンドラー
    const handleItemClickCapture = (e: React.MouseEvent, id: string) => {
        if (e.button !== 0) return; // 左クリックのみ
        if (e.ctrlKey || e.metaKey) {
            e.stopPropagation();
            e.preventDefault();
            setSelectedIds(prev => 
                prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
            );
        }
    };

    if (!isClient) return <CircularProgress />;

    const rootNodes = layout.filter(n => n.parentId === null).sort((a, b) => a.order - b.order);

    return (
        <Box 
            onMouseDown={handleMouseDown} 
            onDragOver={handleDragOver} 
            onDrop={handleDropOnRoot} 
            onContextMenu={handleBgContextMenu} 
            sx={{ minHeight: '60vh', pb: 10, userSelect: isSelecting ? 'none' : 'auto', position: 'relative' }}
        >
            {/* 範囲選択エフェクトボックス */}
            {isSelecting && (
                <Box sx={{
                    position: 'fixed',
                    left: Math.min(selectionBox.startX, selectionBox.endX),
                    top: Math.min(selectionBox.startY, selectionBox.endY),
                    width: Math.abs(selectionBox.endX - selectionBox.startX),
                    height: Math.abs(selectionBox.endY - selectionBox.startY),
                    bgcolor: 'rgba(25, 118, 210, 0.2)',
                    border: '1px solid rgba(25, 118, 210, 0.5)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                }} />
            )}

            <Menu open={bgContextMenu !== null} onClose={handleCloseContextMenus} anchorReference="anchorPosition" anchorPosition={bgContextMenu !== null ? { top: bgContextMenu.mouseY, left: bgContextMenu.mouseX } : undefined}>
                <MenuItem onClick={handleOpenFolderDialogFromMenu}>{msg.CREATE_FOLDER || "フォルダを作成"}</MenuItem>
            </Menu>

            <Menu open={folderContextMenu !== null} onClose={handleCloseContextMenus} anchorReference="anchorPosition" anchorPosition={folderContextMenu !== null ? { top: folderContextMenu.mouseY, left: folderContextMenu.mouseX } : undefined}>
                <MenuItem onClick={handleOpenRenameDialog}>{msg.RENAME_FOLDER || "名前の変更"}</MenuItem>
                <MenuItem onClick={handleTriggerColorPicker}>{msg.CHANGE_FOLDER_COLOR || "色の変更"}</MenuItem>
                <MenuItem onClick={handleDeleteFolderMenu} sx={{ color: 'error.main' }}>{msg.DELETE_FOLDER || "削除"}</MenuItem>
            </Menu>

            <Grid container spacing={2}>
                {rootNodes.map(node => {
                    const isSelected = selectedIds.includes(node.id);
                    if (node.type === 'folder') {
                        const children = layout.filter(n => n.parentId === node.id).sort((a, b) => a.order - b.order);
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={node.id}>
                                <Box 
                                    className="draggable-item" data-id={node.id}
                                    draggable onDragStart={(e) => handleDragStart(e, node.id)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnFolder(e, node.id)} onContextMenu={(e) => handleFolderContextMenu(e, node.id)} onMouseDown={(e) => e.stopPropagation()} 
                                    onClickCapture={(e) => handleItemClickCapture(e, node.id)}
                                    sx={{ height: '100%', cursor: 'grab', position: 'relative', '&:hover .select-checkbox': { opacity: 1 }, ...(isSelected && { outline: '2px solid #1976d2', outlineOffset: '-2px', borderRadius: 1 }) }}
                                >
                                    <Checkbox
                                        className="select-checkbox"
                                        checked={isSelected}
                                        onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, node.id] : prev.filter(id => id !== node.id))}
                                        sx={{ position: 'absolute', top: 4, left: 4, zIndex: 10, opacity: isSelected ? 1 : 0, bgcolor: 'rgba(255,255,255,0.8)', padding: '2px', borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
                                    />
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.100' } }}>
                                        <CardActionArea onClick={() => setOpenFolderId(node.id)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                                            <FolderIcon sx={{ fontSize: 40, color: node.color || 'primary.main', mb: 1 }} />
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="center" sx={{ wordBreak: 'break-word' }}>
                                                {node.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {children.length}  {msg.TEST}
                                            </Typography>
                                        </CardActionArea>
                                    </Card>
                                </Box>
                            </Grid>
                        );
                    } else {
                        const t = tests.find(test => test.id.toString() === node.id);
                        if (!t) return null;
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={node.id}>
                                <Box 
                                    className="draggable-item" data-id={node.id}
                                    draggable onDragStart={(e) => handleDragStart(e, node.id)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnItem(e, node.id)} onMouseDown={(e) => e.stopPropagation()} 
                                    onClickCapture={(e) => handleItemClickCapture(e, node.id)}
                                    sx={{ cursor: 'grab', height: '100%', position: 'relative', '&:hover .select-checkbox': { opacity: 1 }, ...(isSelected && { outline: '2px solid #1976d2', outlineOffset: '-2px', borderRadius: 1 }) }}
                                >
                                    <Checkbox
                                        className="select-checkbox"
                                        checked={isSelected}
                                        onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, node.id] : prev.filter(id => id !== node.id))}
                                        sx={{ position: 'absolute', top: 4, left: 4, zIndex: 10, opacity: isSelected ? 1 : 0, bgcolor: 'rgba(255,255,255,0.8)', padding: '2px', borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
                                    />
                                    <TestCardItem testData={t} onDeleted={handleRemoveFromState} />
                                </Box>
                            </Grid>
                        );
                    }
                })}
            </Grid>

            {/* フォルダ展開ポップアップ */}
            <Dialog 
                open={openFolderId !== null} 
                onClose={() => setOpenFolderId(null)} 
                maxWidth="md" 
                fullWidth
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                {openFolderId && (
                    <Box onMouseDown={handleMouseDown} sx={{ position: 'relative', userSelect: isSelecting ? 'none' : 'auto' }}>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box display="flex" alignItems="center" gap={1} onDragOver={handleDragOver} onDrop={(e) => handleDropOnFolder(e, openFolderId)}>
                                <FolderIcon sx={{ color: layout.find(n => n.id === openFolderId)?.color || 'primary.main' }} />
                                <Typography variant="h6">{layout.find(n => n.id === openFolderId)?.name}</Typography>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers sx={{ minHeight: '30vh', bgcolor: 'grey.50' }}>
                            <Grid container spacing={2}>
                                {layout.filter(n => n.parentId === openFolderId).sort((a, b) => a.order - b.order).map(child => {
                                    const t = tests.find(test => test.id.toString() === child.id);
                                    if (!t) return null;
                                    const isSelected = selectedIds.includes(child.id);
                                    return (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={child.id}>
                                            <Box 
                                                className="draggable-item" data-id={child.id}
                                                draggable onDragStart={(e) => handleDragStart(e, child.id)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnItem(e, child.id)} onMouseDown={(e) => e.stopPropagation()} 
                                                onClickCapture={(e) => handleItemClickCapture(e, child.id)}
                                                sx={{ cursor: 'grab', height: '100%', position: 'relative', '&:hover .select-checkbox': { opacity: 1 }, ...(isSelected && { outline: '2px solid #1976d2', outlineOffset: '-2px', borderRadius: 1 }) }}
                                            >
                                                <Checkbox
                                                    className="select-checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, child.id] : prev.filter(id => id !== child.id))}
                                                    sx={{ position: 'absolute', top: 4, left: 4, zIndex: 10, opacity: isSelected ? 1 : 0, bgcolor: 'rgba(255,255,255,0.8)', padding: '2px', borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
                                                />
                                                <TestCardItem testData={t} onDeleted={handleRemoveFromState} />
                                            </Box>
                                        </Grid>
                                    );
                                })}
                                {layout.filter(n => n.parentId === openFolderId).length === 0 && (
                                    <Grid size={{ xs: 12 }}><Typography textAlign="center" color="text.secondary" mt={4}>空のフォルダです</Typography></Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenFolderId(null)}>{msg.BACK || "閉じる"}</Button>
                        </DialogActions>
                    </Box>
                )}
            </Dialog>

            <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)}>
                <DialogTitle>{msg.CREATE_FOLDER || "新しいフォルダを作成"}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label={msg.NEW_FOLDER_NAME || "フォルダ名"} type="text" fullWidth variant="outlined" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFolderDialogOpen(false)}>{msg.CANCEL}</Button>
                    <Button onClick={handleCreateFolder} variant="contained" disabled={!newFolderName.trim()}>{msg.CREATE_FOLDER || "作成"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
                <DialogTitle>{msg.RENAME_FOLDER || "名前の変更"}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label={msg.NEW_FOLDER_NAME || "フォルダ名"} type="text" fullWidth variant="outlined" value={editFolderName} onChange={(e) => setEditFolderName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameDialogOpen(false)}>{msg.CANCEL}</Button>
                    <Button onClick={handleRenameFolder} variant="contained" disabled={!editFolderName.trim()}>{msg.SAVE || "保存"}</Button>
                </DialogActions>
            </Dialog>

            <input
                type="color"
                ref={colorInputRef}
                value={editFolderColor}
                onChange={handleColorChange}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '0px', height: '0px' }}
            />
        </Box>
    );
}