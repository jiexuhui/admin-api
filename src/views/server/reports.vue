<template>
  <div class="app-container">
    <div class="filter">
      <el-input @keyup.enter.native="handleFilter" style="width:200px;padding:10px" class="filter-item" placeholder="直播ID" v-model="listQuery.pid">
      </el-input>
      <el-date-picker
        v-model="listQuery.time"
        type="datetimerange"
        align="right"
        start-placeholder="提交时间"
        end-placeholder="提交时间"
        :default-time="['12:00:00', '08:00:00']">
      </el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
      <!-- <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button> -->
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" :label="$t('table.id')" width="65">
        <template slot-scope="scope">
          <span>{{scope.$index+1}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="直播ID">
        <template slot-scope="scope">
          <span>{{scope.row.pid}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="观看人数">
        <template slot-scope="scope">
          <span>{{scope.row.watchnum}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="直播时长（分钟）">
        <template slot-scope="scope">
          <span>{{scope.row.ptime}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="售出物品总数">
        <template slot-scope="scope">
          <span>{{scope.row.stotal}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="售出物品详情">
        <template slot-scope="scope">
          <span>{{scope.row.goodsname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="销售总金额">
        <template slot-scope="scope">
          <span>{{scope.row.mtotal}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="提交人">
        <template slot-scope="scope">
          <span>{{scope.row.reporter}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="备注">
        <template slot-scope="scope">
          <span>{{scope.row.rdesc}}</span>
        </template>
      </el-table-column>.
      <el-table-column min-width="150" label="商户ID">
        <template slot-scope="scope">
          <span>{{scope.row.shopid}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="提交时间">
        <template slot-scope="scope">
          <span>{{scope.row.ctime}}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="直播ID" prop="pid" >
          <el-input v-model="temp.pid"></el-input>
        </el-form-item>
        <el-form-item label="观看人数" prop="watchnum" >
          <el-input v-model="temp.watchnum"></el-input>
        </el-form-item>
        <el-form-item label="直播时长" prop="ptime" >
          <el-input v-model="temp.ptime"></el-input>
        </el-form-item>
        <el-form-item label="售出物品总数" prop="stotal" >
          <el-input v-model="temp.stotal"></el-input>
        </el-form-item>
        <el-form-item label="售出物品" prop="stotal" >
          <el-input v-model="temp.stotal"></el-input>
        </el-form-item>
        <el-form-item label="售出总金额" prop="mtotal" >
          <el-input v-model="temp.mtotal"></el-input>
        </el-form-item>
        <el-form-item label="报告人" prop="reporter" >
          <el-input v-model="temp.mtotal"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="rdesc" >
          <el-input v-model="temp.rdesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { reports } from "@/api/server";
import waves from "@/directive/waves"; // 水波纹指令
import { parseTime } from "@/utils";
import { parse } from "path";

export default {
  name: "complexTable",
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pid: 0,
        time: [],
        page: 1,
        limit: 20
      },
      temp: {
        pid: 0,
        watchnum: 0,
        ptime: 0,
        stotal: 0,
        mtotal: 0,
        reporter: "",
        rdesc: ""
      },
      bookstatus: [
        {
          value: 0,
          label: "关闭"
        },
        {
          value: 1,
          label: "订阅"
        }
      ],
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create"
      },
      rules: {
        rolename: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.listQuery.pid = this.$route.params.pid;
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      reports(this.listQuery).then(response => {
        let data = response.data[0];
        //  console.log("data1:" ,data)
        for (let item of data) {
          let goodsnames = item.goodsname.split(",");
          let nums = item.num.split(",");
          let goodsname = "";
          let num = "";
          let kearr = [];
          for (let i = 0; i < goodsnames.length; i++) {
            goodsname = goodsnames[i] + ":" + nums[i];
            kearr.push(goodsname);
          }
          item.goodsname = kearr.toString();
        }
        this.list = data;
        this.total = response.data[1][0].count;
        this.listLoading = false;
      });
    },
    handleModifyStatus(row) {
      this.temp.id = row.id;
      if (row.isbook === 0) {
        updateapply(this.temp).then(res => {
          if (res.code === 200) {
            this.getList();
            this.$notify({
              title: "成功",
              message: "订阅成功",
              type: "success",
              duration: 2000
            });
          }
        });
      }
    },
    resetTemp() {
      this.temp = {
        rolename: undefined,
        utime: ""
      };
    },
    handleCreate() {
      this.resetTemp();
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
          addrole(this.temp).then(res => {
            if (res.code === 200) {
              this.temp.id = res.data.id;
              this.temp.utime = res.data.utime;
              this.list.unshift(this.temp);
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
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    }
  }
};
</script>
