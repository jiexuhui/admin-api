<template>
  <div class="app-container">
    <div class="filter">
      <el-input @keyup.enter.native="handleFilter" style="width:200px;padding:10px" class="filter-item" placeholder="昵称" v-model="listQuery.nickname">
      </el-input>
      审核状态：<el-select v-model="listQuery.review" placeholder="请选择" style="width:200px;padding:10px" >
        <el-option
          v-for="item in reviewstatus"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
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
      <el-table-column align="center" label="主播ID">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="昵称">
        <template slot-scope="scope">
          <span>{{scope.row.nickName}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="性别">
        <template slot-scope="scope">
          <span>{{scope.row.gender === 1?'男':'女'}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="地址">
        <template slot-scope="scope">
          <span>{{scope.row.country}}{{scope.row.province}}{{scope.row.city}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="真实  姓名">
        <template slot-scope="scope">
          <span>{{scope.row.realname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="联系电话">
        <template slot-scope="scope">
          <span>{{scope.row.phone}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="微信号">
        <template slot-scope="scope">
          <span>{{scope.row.wechataccount}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="直播间ID">
        <template slot-scope="scope">
          <span>{{scope.row.anchorroomid}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" label="提交时间">
        <template slot-scope="scope">
          <span>{{scope.row.utime}}</span>
        </template>
      </el-table-column>
       <el-table-column min-width="150" label="最近登录 ">
        <template slot-scope="scope">
          <span>{{scope.row.last_login_time}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="viewReport(scope.row)" v-if="scope.row.review===1">查看播单
          </el-button>
          <!-- <el-button type="success" size="mini" @click="viewReport(scope.row)" v-if="scope.row.review===0">查看报告
          </el-button> -->
          <el-button type="success" size="mini" @click="handleModifyStatus(scope.row)" v-if="scope.row.review===0">审核
          </el-button>
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
import { anchors, anchorreview } from "@/api/server";
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
        nickname: "",
        page: 1,
        limit: 20,
        review: 0
      },
      temp: {
        review: 1
      },
      reviewstatus: [
        {
          value: 2,
          label: "所有"
        },
        {
          value: 0,
          label: "未审核"
        },
        {
          value: 1,
          label: "已审核"
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
    this.getList();
  },
  methods: {
    viewReport(row) {
      this.$router.push({ name: "申请", params: { anchor: row.id } });
    },

    getList() {
      this.listLoading = true;
      anchors(this.listQuery).then(response => {
        this.list = response.data[0];
        //  console.log("data1:" ,data)is.list = data;
        this.total = response.data[1][0].count;
        this.listLoading = false;
      });
    },
    handleModifyStatus(row) {
      this.temp.id = row.id;
      if (row.review === 0) {
        anchorreview(this.temp).then(res => {
          if (res.code === 200) {
            this.getList();
            this.$notify({
              title: "成功",
              message: "审核成功",
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
