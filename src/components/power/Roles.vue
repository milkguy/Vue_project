<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addUserDialogVisible=true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表区 -->
            <el-table :data="roleList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag> 
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环嵌套渲染二级权限 -->
                                <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag 
                                        type="success" 
                                        closable @close="removeRightById(scope.row,item2.id)"
                                        >{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag v-for="(item3,i3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>

                            </el-col>
                        </el-row>
                        <pre>
                            
                        </pre>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showRolesEditDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                        @click = "removeRoleById(scope.row.id)"
                        >删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click = "showSetRightDialog(scope.row)">分配权限</el-button>
                    </template> 
                </el-table-column>
                
            </el-table>
        </el-card>

        <!-- 分配权限对话框 -->
        <el-dialog
        title="分配权限"
        :visible.sync="SetRightDialogVisible"
        width="50%" @close = "setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>

            <span slot="footer" class="dialog-footer">
                 <el-button @click="SetRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 添加用户对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addUserDialogVisible"
            width="50%"
            @close = "addUserDialogClose"
            >

            <!-- 内容主体区域 -->
            <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="70px">
                <el-form-item label="角色名" prop="roleName">
                    <el-input v-model="addUserForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="roleDesc">
                    <el-input v-model="addUserForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addUserDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑修改用户对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editRolesDialogVisible"
            width="50%"
            @close="editRolesDialogClosed"
            >
            <el-form :model="editForm" :rules="editRolesFormRules" ref="editRolesFormRef" label-width="70px">
                <el-form-item label="名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRolesDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRolesInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return{
            //所有角色列表数据
            roleList:[],
            //控制分配权限对话框的显示与隐藏
            SetRightDialogVisible : false,
            //所有权限数据
            rightsList:[],
            //树形控件的属性绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            //默认选中的数组id值
            defKeys:[],
            //当前即将分配权限的角色id
            roleId:'',
            // 添加用户对话框显示与隐藏
            addUserDialogVisible:false,
            //添加用户信息
            addUserForm:{
                roleName:'',
                roleDesc:''
            },
            //添加用户验证规则
            addUserFormRules:{
                roleName:[
                     { required: true, message: '请输入角色名', trigger: 'blur' },{min:3,max:10, message: '用户名的长度在3到10个字符之间', trigger: 'blur'}
                ],
                roleDesc:[
                    { required: true, message: '请输入角色描述', trigger: 'blur' },{min:5,max:20, message: '描述长度在5到20个字符之间', trigger: 'blur'}
                ],
            },
            // 编辑角色对话框的显示与隐藏
            editRolesDialogVisible:false,

            //编辑表单角色验证规则对象
            editRolesFormRules:{
                roleName:[
                    { required: true, message: '请输入角色名称', trigger: 'blur' }
                ],
                roleDesc:[
                    { required: true, message: '请输入角色描述', trigger: 'blur' }
                ]
            },
            //查询用户对象信息
            editForm:{},
        }
    },
    created(){
        this.getRolesList()
    },
    methods:{
        //获取所有角色的列表
        async getRolesList(){
            const {data:res} = await this.$http.get('roles')
            if(res.meta.status!==200){
                return this.$message.error('获取角色列表失败')
            }
            this.roleList = res.data
        },
 
        async removeRightById(role,rightId){
            //弹框提示用户是否要删除
            const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=>err)
            if(confirmResult!=='confirm'){
                return this.$message.info('取消了删除')
            }
            const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if(res.meta.status!==200){
                return this.$message.error('删除权限失败')
            }
            role.children = res.data
        },
        async showSetRightDialog(role){
            this.roleId = role.id
            //获取所有权限的数据
            const {data:res} = await this.$http.get('rights/tree')
            if(res.meta.status!==200){
                return this.$message.error('获取用户权限失败')
            }
            this.rightsList = res.data
            //递归获取三级节点的id
            this.getLeafKeys(role,this.defKeys)
            // 展示分配权限的对话框
            this.SetRightDialogVisible = true
        },
        // 通过递归的形式获取角色下所有三级权限的id
        getLeafKeys(node,arr){
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item => {
                this.getLeafKeys(item,arr)
            });
        },
        //监听分配权限对话框的关闭事件
        setRightDialogClosed(){
            this.defKeys = []
        },
        //点击为角色分配权限
        async allotRights(){
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            const idStr = keys.join(',')
            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
            if(res.meta.status!==200){
                return this.$message.error('分配权限失败')
            }
            this.$message.success('分配权限成功')
            this.getRolesList()
            this.SetRightDialogVisible = false 

        },
        // 添加用户按钮
        addUser(){
            this.$refs.addUserFormRef.validate(async valid =>{
                if(!valid) return
                const {data:res} = await this.$http.post('roles',this.addUserForm)
                if(res.meta.status!==201){
                    return this.$message.error('添加用户失败')
                }
                this.getRolesList()
                this.addUserDialogVisible = false
            })
        },
        addUserDialogClose(){
            this.$refs.addUserFormRef.resetFields()
        },
        // 根据id删除角色
        async removeRoleById(id){
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=>err)
            if(confirmResult!=='confirm'){
                return this.$message.info('已经取消删除')
            }
            const {data:res} = await this.$http.delete('roles/'+id)
            if(res.meta.status!==200){
                return this.$message.error('删除角色失败')
            }
            this.$message.success('删除角色成功')
            this.getRolesList()
        },
        //展示编辑用户对话框
        async showRolesEditDialog(id){
            const {data:res} = await this.$http.get('roles/'+id)
            if(res.meta.status!==200){
                return this.$message.error('查询用户信息失败')
            }
            this.editForm = res.data
            this.editRolesDialogVisible = true
        },
        editRolesInfo(){
            this.$refs.editRolesFormRef.validate(async valid=>{
                if(!valid) return
                const {data:res} = await this.$http.put('roles/'+this.editForm.roleId,{roleName:this.editForm.roleName,roleDesc:this.editForm.roleDesc})
                if(res.meta.status!==200){
                    return this.$message.error('更新用户信息失败')
                }
                this.editRolesDialogVisible = false
                this.getRolesList()
                this.$message.success('更新用户信息成功')
            })
        },
        editRolesDialogClosed(){
            this.$refs.editRolesFormRef.resetFields() 
        },
    }

    
}
</script>

<style lang="less" scoped>

</style>