<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="querInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- table表格区域 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="120px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="120px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="160px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editById(scope.row.goods_id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
               <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum"
                :page-sizes="[3, 5, 10,15]"
                :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
                </el-pagination>
        </el-card>
        <!-- 编辑商品对话框 -->
        <el-dialog
        title="编辑商品"
        :visible.sync="editDialogVisible"
        width="50%">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="editForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="editForm.goods_number"></el-input>
            </el-form-item>
             <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="editForm.goods_weight"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editFormInfo">确 定</el-button>
        </span>
        </el-dialog>
    </div>    
</template>

<script>
export default {
    data(){
        return{
            //查询参数对象
            querInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            //商品列表
            goodsList:[],
            // 商品总数据条数
            total:0,
            editDialogVisible:false,
            editForm:{
                goods_name:''
            },
            editFormRules:{
                goods_name:[
                    {required:true,message:"请输入商品名称",trigger:'blur'}
                ],
                goods_number:[
                    {required:true,message:"请输入商品名称",trigger:'blur'}
                ],
                goods_price:[
                    {required:true,message:"请输入商品名称",trigger:'blur'}
                ],
                goods_weight:[
                    {required:true,message:"请输入商品重量",trigger:'blur'}
                ]
            }
        }
    },
    created(){
        this.getGoodsList()
    },
    methods:{
        //根据分页获取对应的商品列表
        async getGoodsList(){
            const {data:res} = await this.$http.get('goods',{params:this.querInfo})
            if(res.meta.status!==200){
                return this.$message.error('获取商品列表失败')
            }
            this.goodsList = res.data.goods
            this.total = res.data.total
        },
        handleSizeChange(newSize){
            this.querInfo.pagesize = newSize
            this.getGoodsList()
        },
        handleCurrentChange(newPage){
            this.querInfo.pagenum = newPage
            this.getGoodsList()
        },
        //根据id删除商品
        async removeById(id){
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=>err)
            console.log(confirmResult)
            if(confirmResult!=='confirm'){
                return this.$message.info('已经取消删除商品')
            }
            const {data:res} = await this.$http.delete('goods/'+id)
            if(res.meta.status!==200){
                return this.$message.error('删除商品失败')
            }
            this.$message.success('删除商品成功')
            this.getGoodsList()
        },
        goAddPage(){
            this.$router.push('/goods/add')
        },
        async editById(id){
            this.editDialogVisible = true
            const{data:res} = await this.$http.get('goods/'+id)
            if(res.meta.status!==200){
                return this.$http.error('获取商品信息失败')
            }
            this.editForm = res.data
            console.log(this.editForm)
        },
        async editFormInfo(){
            const {data:res} = await this.$http.put(`goods/${this.editForm.goods_id}`,this.editForm)
            if(res.meta.status!==200){
                return this.$message.error('修改信息失败')
            }
            console.log(res)
            this.$message.success('修改信息成功')
            this.getGoodsList()
            this.editDialogVisible = false
        }
    }
}
</script>

<style lang="less" scoped>

</style>