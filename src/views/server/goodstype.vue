<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>
    <tree-table :data="data" :evalFunc="func" style="width: 50%;" :evalArgs="args" :expandAll="expandAll" border>
      <el-table-column label="名称">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" >
        <template slot-scope="scope">
          <el-button v-if="scope.row.fid === 0 " class="filter-item" size="mini" @click="handleCreate(scope.row)" type="primary">{{$t('table.add')}}</el-button>
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
import treeTable from "@/components/TreeTable";
import treeToArray from "./customEval";
import {
  goodstypes,
  addgoodstype,
  editgoodstype,
  delgoodstype
} from "@/api/server";

export default {
  name: "customTreeTableDemo",
  components: { treeTable },
  data() {
    return {
      func: treeToArray,
      expandAll: true,
      data: [],
      args: [null, null, null],
      listLoading: true,
      temp: {
        fid: 0,
        name: ""
      },
      edittemp: {
        id: "",
        name: ""
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create"
      },
      rules: {
        name: [{ required: true, message: "请输入类型名称", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      goodstypes().then(response => {
        this.data = response.data;
        this.listLoading = false;
      });
    },
    resetTemp() {
      this.temp = {
        fid: 0,
        name: ""
      };
    },
    handleCreate(row = "") {
      this.resetTemp();
      this.temp.fid = row.id || 0;
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          console.log(this.temp);
          addgoodstype(this.temp).then(res => {
            console.log("res:", res);
            if (res.code === 200) {
              this.getList();
              this.dialogFormVisible = false;
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
            }
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      console.log("temp", this.temp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          console.log("edittemp", this.temp);
          this.edittemp.id = this.temp.id;
          this.edittemp.name = this.temp.name;
          const tempData = Object.assign({}, this.edittemp);
          // console.log("tempData", tempData);
          editgoodstype(tempData).then(res => {
            console.log("res:", res);
            if (res.code == 200) {
              this.getList();
              this.dialogFormVisible = false;
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000
              });
            }
          });
        }
      });
    },
    handleDelete(row) {
      this.$confirm("确定删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const id = { id: row.id };
          delgoodstype(id).then(res => {
            if (res.code == 200) {
              this.getList();
              this.$notify({
                title: "成功",
                message: "删除成功",
                type: "success",
                duration: 2000
              });
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>
