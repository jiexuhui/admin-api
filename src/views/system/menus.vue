<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>
    <tree-table :data="data" :evalFunc="func" :evalArgs="args" :expandAll="expandAll" border>
      <!-- <el-table-column label="ID">
        <template slot-scope="scope">
           <span>{{scope.row.id}}</span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="名称">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="标题">
        <template slot-scope="scope">
          <span>{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column label="path">
        <template slot-scope="scope">
          <span>{{scope.row.path}}</span>
        </template>
      </el-table-column>
      <el-table-column label="icon">
        <template slot-scope="scope">
          <span>{{scope.row.icon_style}}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示">
        <template slot-scope="scope">
          <span>{{scope.row.display==1?"显示":"不显示"}}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后一级">
        <template slot-scope="scope">
          <span>{{scope.row.isaction==1?'是':"否"}}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="排序">
        <template slot-scope="scope">
          <span>{{scope.row.display}}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-button class="filter-item" size="mini" @click="handleCreate(scope.row)" type="primary" v-if="scope.row.isaction == 0">{{$t('table.add')}}</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>
          <el-button v-if="scope.row.status!='deleted'" size="mini" type="danger" @click="handleDelete(scope.row)">{{$t('table.delete')}}
          </el-button>
        </template>
      </el-table-column>
    </tree-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name"></el-input>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title"></el-input>
        </el-form-item>
        <el-form-item label="path" prop="path">
          <el-input v-model="temp.path"></el-input>
        </el-form-item>
        <el-form-item label="icon" prop="icon_style">
          <el-input v-model="temp.icon_style"></el-input>
        </el-form-item>
        <el-form-item label="是否显示" prop="display">
          <el-select class="filter-item" v-model="temp.display"  placeholder="请选择">
            <el-option v-for="item in display" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最后一级" prop="isaction">
          <el-select class="filter-item" v-model="temp.isaction" placeholder="请选择">
            <el-option v-for="item in action" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="temp.sort"></el-input-number>
        </el-form-item>
        <div><span style="color:red;">tips:越小越靠前</span></div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
  Auth: Lei.j1ang
  Created: 2018/1/19-14:54
*/
import treeTable from '@/components/TreeTable'
import treeToArray from './customEval'
import { menus, addmenu, editmenu, delmenu} from '@/api/system'

export default {
  name: 'customTreeTableDemo',
  components: { treeTable },
  data() {
    return {
      func: treeToArray,
      expandAll: true,
      data:{},
      args: [null, null, null],
      listLoading: true,
      temp: {
        pid:0,
        name:"",
        title:"",
        path:"",
        icon_style: "",
        display: 1,
        sort: 1,
        isaction:0
      },
      edittemp: {
        id:0,
        name:"",
        title:"",
        path:"",
        icon_style: "",
        display: 1,
        sort: 1,
        isaction:0
      },
      display : [
        {
          value: 1,
          label: '显示'
        }, {
          value: 0,
          label: '不显示'
        }
      ], 
      action: [
        {
          value: 1,
          label: '是'
        }, {
          value: 0,
          label: '否'
        }
      ], 
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      selectDisplay:"",
      rules: {
        name: [
          { required: true, message: "请输入菜单名称", trigger: "blur" }
        ],
        title: [
          { required: true, message: "请输入菜单标题", trigger: "blur" }
        ],
        path: [
          { required: true, message: "请输入路劲", trigger: "blur" },
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    selectGet(vId){//这个vId也就是value值
      let obj = {};
      obj = this.display.find((item)=>{//这里的userList就是上面遍历的数据源
          return item.value === vId;//筛选出匹配数据
      });
      this.selectDisplay = obj;
    },
    getList() {
      this.listLoading = true
      menus().then(response => {
        this.data = response.data;
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        pid:0,
        name:"",
        title:"",
        path:"",
        icon_style: "",
        display: 1,
        sort: 1,
        isaction:0
      }
    },
    handleCreate(row="") {
      this.resetTemp()
      console.log("row:",row);
      this.temp.pid = row.id || 0;
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addmenu(this.temp).then(res => {
            console.log("res:",res);
            if(res.code === 200){
              this.getList();
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            }
          })
        }
      })
    },
    handleUpdate(row) {
      this.edittemp.id = row.id;
      this.temp = Object.assign({}, row) // copy obj
       console.log("temp",this.temp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.edittemp.name = this.temp.name;
          this.edittemp.title = this.temp.title;
          this.edittemp.path = this.temp.path;
          this.edittemp.icon_style = this.temp.icon_style;
          this.edittemp.display = this.temp.display;
          this.edittemp.sort = this.temp.sort;
          this.edittemp.isaction = this.temp.isaction;
          console.log("edittemp",this.edittemp)
          const tempData = Object.assign({}, this.edittemp)
          console.log("tempData",tempData)
          editmenu(tempData).then(res => {
            console.log("res:",res);
            if(res.code == 200 ){
              this.getList();
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            }
          })
        }
      })
    },
    handleDelete(row) {
       this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delmenu(row.id).then(res => {
          if(res.code == 200 ){
            this.getList();
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
  }
}
</script>
